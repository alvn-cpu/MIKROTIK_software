const cron = require('cron');
const moment = require('moment');
const mikrotikService = require('./mikrotikService');
const UsersRepo = require('../models/users');
const SessionsRepo = require('../models/sessions');
const { getDB } = require('../config/database');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.jobs = new Map();
    this.startPeriodicChecks();
  }

  /**
   * Start periodic checks for user plan expiry and low time warnings
   */
  startPeriodicChecks() {
    // Check every 15 minutes for users who need notifications
    const job = new cron.CronJob('*/15 * * * *', async () => {
      await this.checkUsersForNotifications();
    });
    job.start();
    
    this.jobs.set('periodic-check', job);
    logger.info('Notification service started with periodic checks');
  }

  /**
   * Check all active users for notification triggers
   */
  async checkUsersForNotifications() {
    try {
      const db = getDB();
      
      // Get users with active sessions and their plan details
      const usersWithActivePlans = await db('users')
        .select(
          'users.id',
          'users.email', 
          'users.phone',
          'sessions.id as session_id',
          'sessions.started_at',
          'sessions.plan_duration',
          'billing_plans.duration_hours',
          'billing_plans.name as plan_name'
        )
        .join('sessions', 'users.id', 'sessions.user_id')
        .join('billing_plans', 'sessions.plan_id', 'billing_plans.id')
        .whereNull('sessions.ended_at');

      for (const user of usersWithActivePlans) {
        await this.checkUserForNotification(user);
      }
      
      logger.info(`Checked ${usersWithActivePlans.length} active users for notifications`);
    } catch (error) {
      logger.error('Error in periodic notification check:', error);
    }
  }

  /**
   * Check individual user for notification triggers
   */
  async checkUserForNotification(user) {
    try {
      const sessionStart = moment(user.started_at);
      const sessionEnd = sessionStart.clone().add(user.duration_hours, 'hours');
      const now = moment();
      const minutesRemaining = sessionEnd.diff(now, 'minutes');

      // Define notification thresholds (in minutes)
      const notificationThresholds = [
        { minutes: 60, message: '1 hour' },    // 1 hour remaining
        { minutes: 30, message: '30 minutes' }, // 30 minutes remaining
        { minutes: 15, message: '15 minutes' }, // 15 minutes remaining
        { minutes: 5, message: '5 minutes' }    // 5 minutes remaining
      ];

      for (const threshold of notificationThresholds) {
        if (minutesRemaining <= threshold.minutes && minutesRemaining > (threshold.minutes - 15)) {
          // Check if we haven't already sent this notification
          const notificationSent = await this.hasNotificationBeenSent(
            user.session_id, 
            threshold.minutes
          );

          if (!notificationSent) {
            await this.sendExpiryWarning(user, threshold.message, minutesRemaining);
            await this.recordNotificationSent(user.session_id, threshold.minutes);
          }
          break; // Only send one notification per check
        }
      }

      // Send final expiry notification
      if (minutesRemaining <= 0) {
        await this.sendSessionExpiredNotification(user);
      }

    } catch (error) {
      logger.error(`Error checking notifications for user ${user.id}:`, error);
    }
  }

  /**
   * Send expiry warning to user
   */
  async sendExpiryWarning(user, timeRemaining, exactMinutes) {
    try {
      const message = `⚠️ WARNING: Your ${user.plan_name} plan expires in ${timeRemaining}! Please renew to continue enjoying internet access.`;
      
      // Get MikroTik router configuration (you'll need to store this in your config)
      const routerConfig = this.getRouterConfig();
      
      const result = await mikrotikService.sendHotspotNotification({
        ...routerConfig,
        user: user.email, // or however you identify users in MikroTik
        message: message
      });

      if (result.success) {
        logger.info(`Expiry warning sent to user ${user.email}: ${timeRemaining} remaining`);
        
        // Also send real-time notification via Socket.IO if user is connected
        const io = require('../server').io;
        if (io) {
          io.to(`user-${user.id}`).emit('plan-expiry-warning', {
            message,
            minutesRemaining: exactMinutes,
            planName: user.plan_name
          });
        }
      } else {
        logger.error(`Failed to send notification to ${user.email}:`, result.error);
      }

      return result;
    } catch (error) {
      logger.error('Error sending expiry warning:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send session expired notification
   */
  async sendSessionExpiredNotification(user) {
    try {
      const message = `🚫 Your ${user.plan_name} plan has expired! Please purchase a new plan to continue using the internet.`;
      
      const routerConfig = this.getRouterConfig();
      
      const result = await mikrotikService.sendHotspotNotification({
        ...routerConfig,
        user: user.email,
        message: message
      });

      // Also disconnect the user
      await mikrotikService.disconnectHotspotUser({
        ...routerConfig,
        user: user.email
      });

      // Update session as ended
      await SessionsRepo.update(user.session_id, { 
        ended_at: new Date(),
        end_reason: 'expired'
      });

      logger.info(`Session expired notification sent and user disconnected: ${user.email}`);
      return result;
    } catch (error) {
      logger.error('Error sending session expired notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send custom notification to specific user
   */
  async sendCustomNotification(userId, message, type = 'info') {
    try {
      const user = await UsersRepo.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const routerConfig = this.getRouterConfig();
      
      const result = await mikrotikService.sendHotspotNotification({
        ...routerConfig,
        user: user.email,
        message: message
      });

      // Also send via Socket.IO
      const io = require('../server').io;
      if (io) {
        io.to(`user-${userId}`).emit('custom-notification', {
          message,
          type,
          timestamp: new Date()
        });
      }

      logger.info(`Custom notification sent to user ${user.email}: ${message}`);
      return result;
    } catch (error) {
      logger.error('Error sending custom notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast notification to all active users
   */
  async broadcastNotification(message, type = 'announcement') {
    try {
      const routerConfig = this.getRouterConfig();
      
      const result = await mikrotikService.broadcastNotification({
        ...routerConfig,
        message: message
      });

      // Also broadcast via Socket.IO
      const io = require('../server').io;
      if (io) {
        io.emit('broadcast-notification', {
          message,
          type,
          timestamp: new Date()
        });
      }

      logger.info(`Broadcast notification sent: ${message}`);
      return result;
    } catch (error) {
      logger.error('Error broadcasting notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get router configuration from environment or database
   */
  getRouterConfig() {
    return {
      host: process.env.MIKROTIK_HOST || 'localhost',
      username: process.env.MIKROTIK_USERNAME || 'admin',
      password: process.env.MIKROTIK_PASSWORD || '',
      port: parseInt(process.env.MIKROTIK_PORT) || 8728
    };
  }

  /**
   * Check if notification has already been sent
   */
  async hasNotificationBeenSent(sessionId, thresholdMinutes) {
    try {
      const db = getDB();
      const result = await db('notification_log')
        .where({
          session_id: sessionId,
          threshold_minutes: thresholdMinutes
        })
        .first();
      
      return !!result;
    } catch (error) {
      // If table doesn't exist, assume no notification sent
      return false;
    }
  }

  /**
   * Record that a notification has been sent
   */
  async recordNotificationSent(sessionId, thresholdMinutes) {
    try {
      const db = getDB();
      await db('notification_log').insert({
        session_id: sessionId,
        threshold_minutes: thresholdMinutes,
        sent_at: new Date()
      });
    } catch (error) {
      logger.error('Error recording notification log:', error);
    }
  }

  /**
   * Stop all notification jobs
   */
  stopNotifications() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped notification job: ${name}`);
    });
    this.jobs.clear();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;