import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:badges/badges.dart' as badges;
import 'package:crystal_navigation_bar/crystal_navigation_bar.dart';
import 'package:iconly/iconly.dart';
import 'components/home/home.dart';
import 'components/notify/notification_screen.dart';
import 'components/scan/projectlistappbar.dart';
import 'components/doc/doc.dart';
import 'components/scan/scanpage.dart';
import 'providers/user_provider.dart';
import 'providers/notification_provider.dart';
import 'login.dart';

class MainMenu extends StatefulWidget {
  const MainMenu({super.key});

  @override
  State<MainMenu> createState() => _MainMenuState();
}

class _MainMenuState extends State<MainMenu> {
  int _selectedIndex = 0;
  bool _hasFetchedNotifications = false;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  List<Widget> getPagesForRole(String role) {
    switch (role.toLowerCase()) {
      case 'user':
        return [
          const Home(),
          const ScanActivityScreen(),
          const NotificationScreen(),
          const Doc(),
        ];
      case 'organizer':
        return [
          const Home(),
          const pjAppbar(),
          const Doc(),
        ];
      case 'admin':
        return [
          const Home(),
          const Center(child: Text("จัดการผู้ใช้", style: TextStyle(fontSize: 24))),
          const Doc(),
        ];
      default:
        return [const Home()];
    }
  }

  List<CrystalNavigationBarItem> getNavItemsForRole(String role, int unreadCount) {
    switch (role.toLowerCase()) {
      case 'user':
        return [
          CrystalNavigationBarItem(icon: IconlyBold.home, selectedColor: Colors.white),
          CrystalNavigationBarItem(icon: IconlyBold.scan, selectedColor: Colors.white),
          CrystalNavigationBarItem(
            icon: IconlyBold.notification, 
            selectedColor: Colors.white,
            badge: unreadCount > 0
                ? Badge(
                    label: Text(
                      unreadCount.toString(),
                      style: const TextStyle(color: Colors.white),
                    ),
                  )
                : null,
          ),

          CrystalNavigationBarItem(icon: IconlyBold.document, selectedColor: Colors.white),
        ];
      case 'organizer':
        return [
          CrystalNavigationBarItem(icon: IconlyBold.home, selectedColor: Colors.white),
          CrystalNavigationBarItem(icon: IconlyBold.scan, selectedColor: Colors.white),
          CrystalNavigationBarItem(icon: IconlyBold.document, selectedColor: Colors.white),
        ];
      case 'admin':
        return [
          CrystalNavigationBarItem(icon: IconlyBold.home, selectedColor: Colors.white),
          CrystalNavigationBarItem(icon: IconlyBold.document, selectedColor: Colors.white),
        ];
      default:
        return [
          CrystalNavigationBarItem(icon: IconlyBold.home, selectedColor: Colors.white),
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;
    final notificationProvider = Provider.of<NotificationProvider>(context);

    if (user != null && user.role.toLowerCase() == 'user' && !_hasFetchedNotifications) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        notificationProvider.fetchNotifications(user.msId);
        _hasFetchedNotifications = true; 
      });
    }

    if (user == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
        );
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final role = user.role.toLowerCase();
    final pages = getPagesForRole(role);
    final navItems = getNavItemsForRole(role, notificationProvider.unreadCount);

    final safeIndex = _selectedIndex < pages.length ? _selectedIndex : 0;

    return Scaffold(
      body: pages[safeIndex],
      bottomNavigationBar: Consumer<NotificationProvider>(
        builder: (context, notificationProvider, child) {
          final navItems = getNavItemsForRole(role, notificationProvider.unreadCount);
          return CrystalNavigationBar(
            backgroundColor: Colors.deepPurple.withAlpha(150),
            items: navItems,
            onTap: _onItemTapped,
            currentIndex: safeIndex,
          );
        },
      ),
    );
  }
}