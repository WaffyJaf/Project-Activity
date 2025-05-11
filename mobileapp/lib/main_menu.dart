import 'package:crystal_navigation_bar/crystal_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';
import 'package:provider/provider.dart';
import 'components/home/home.dart';
import 'components/scan/projectlist.dart';
import 'components/doc/doc.dart';
import 'components/scan/scanpage.dart';
import 'providers/user_provider.dart';
import 'login.dart';

class MainMenu extends StatefulWidget {
  const MainMenu({super.key});

  @override
  State<MainMenu> createState() => _MainMenuState();
}

class _MainMenuState extends State<MainMenu> {
  int _selectedIndex = 0;

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
          const Center(child: Text("Notify Page", style: TextStyle(fontSize: 24))),
          const Doc(),
        ];
      case 'organizer':
        return [
          const Home(),
          const ProjectView(),
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

  List<CrystalNavigationBarItem> getNavItemsForRole(String role) {
    switch (role.toLowerCase()) {  
      case 'user':
        return [
          CrystalNavigationBarItem(icon: IconlyBold.home, selectedColor: Colors.white),
          CrystalNavigationBarItem(icon: IconlyBold.scan, selectedColor: Colors.white),
          CrystalNavigationBarItem(icon: IconlyBold.notification, selectedColor: Colors.white),
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
    final navItems = getNavItemsForRole(role);

    final safeIndex = _selectedIndex < pages.length ? _selectedIndex : 0;

    return Scaffold(
      body: pages[safeIndex],
      bottomNavigationBar: CrystalNavigationBar(
        backgroundColor: Colors.deepPurple.withAlpha(150),
        items: navItems,
        onTap: _onItemTapped,
        currentIndex: safeIndex,
      ),
    );
  }
}

