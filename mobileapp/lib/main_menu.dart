import 'package:crystal_navigation_bar/crystal_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';
import 'package:provider/provider.dart';
import 'components/home/home.dart';
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
  var _selectedIndex = 0;

  late List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const Home(),
      const ScanScreen(),
      const Center(child: Text("Notify Page", style: TextStyle(fontSize: 24))),
      const Doc(),
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
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

    return Scaffold(
      // AppBar removed
      body: _pages[_selectedIndex],
      bottomNavigationBar: CrystalNavigationBar(
        backgroundColor: Colors.deepPurple.withValues(alpha: 0.6),
        items: <CrystalNavigationBarItem>[
          CrystalNavigationBarItem(
            icon: IconlyBold.home,
            selectedColor: Colors.white,
          ),
          CrystalNavigationBarItem(
            icon: IconlyBold.scan,
            selectedColor: Colors.white,
          ),
          CrystalNavigationBarItem(
            icon: IconlyBold.notification,
            selectedColor: Colors.white,
          ),
          CrystalNavigationBarItem(
            icon: IconlyBold.document,
            selectedColor: Colors.white,
          ),
        ],
        onTap: _onItemTapped,
        currentIndex: _selectedIndex,
      ),
    );
  }
}