import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import '../../providers/notification_provider.dart';
import '../../providers/user_provider.dart';


class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notificationProvider = Provider.of<NotificationProvider>(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'การแจ้งเตือน',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 22,
            color: Color.fromARGB(255, 255, 255, 255)
          ),
        ),
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.1),
        backgroundColor: theme.primaryColor,
        actions: [
          badges.Badge(
            badgeContent: Text(
              notificationProvider.unreadCount.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            showBadge: notificationProvider.unreadCount > 0,
            badgeStyle: badges.BadgeStyle(
              badgeColor: Colors.redAccent,
              padding: const EdgeInsets.all(6),
            ),
            child: IconButton(
              icon: const Icon(
                Icons.notifications,
                size: 28,
              ),
              onPressed: () {
                // Already on notification screen
              },
            ),
          ),
          const SizedBox(width: 10),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              theme.scaffoldBackgroundColor,
              Colors.grey.shade100,
            ],
          ),
        ),
        child: RefreshIndicator(
          color: theme.primaryColor,
          onRefresh: () async {
            final user = Provider.of<UserProvider>(context, listen: false).user;
            if (user != null) {
              await Provider.of<NotificationProvider>(context, listen: false)
                  .fetchNotifications(user.msId);
            }
          },
          child: Consumer<NotificationProvider>(
            builder: (context, notificationProvider, child) {
              if (notificationProvider.isLoading) {
                return const Center(
                  child: CircularProgressIndicator(),
                );
              } else if (notificationProvider.notifications.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.notifications_off,
                        size: 60,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'ไม่มีแจ้งเตือน',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                );
              } else {
                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: notificationProvider.notifications.length,
                  itemBuilder: (context, index) {
                    final notification = notificationProvider.notifications[index];
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Card(
                        elevation: 3,
                        shadowColor: Colors.black.withOpacity(0.1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          title: Text(
                            notification.title,
                            style: TextStyle(
                              fontWeight: notification.read
                                  ? FontWeight.normal
                                  : FontWeight.bold,
                              fontSize: 15,
                              color: theme.textTheme.bodyLarge?.color,
                            ),
                          ),
                          subtitle: Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              notification.body ?? '',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (!notification.read)
                                const Icon(
                                  Icons.circle,
                                  color: Colors.redAccent,
                                  size: 10,
                                ),
                              if (notification.eventId != null) ...[
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(
                                    Icons.event,
                                    color: Colors.blueAccent,
                                    size: 24,
                                  ),
                                  onPressed: () {
                                    print('Navigating to home from event: ${notification.eventId}');
                                    Navigator.pushNamed(context, '/main_menu');
                                  },
                                  tooltip: 'ไปที่หน้าหลัก',
                                ),
                              ],
                            ],
                          ),
                          onTap: () async {
                            if (!notification.read) {
                              print('Marking as read: ${notification.id}');
                              await notificationProvider.markAsRead(notification.id);
                            }
                            if (notification.eventId != null) {
                              print('Navigate to event: ${notification.eventId}');
                              Navigator.pushNamed(context, '/main_menu');
                            }
                          },
                          tileColor: notification.read
                              ? Colors.white
                              : const Color.fromARGB(255, 243, 227, 253),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    );
                  },
                );
              }
            },
          ),
        ),
      ),
    );
  }
}