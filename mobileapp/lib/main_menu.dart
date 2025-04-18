import 'package:crystal_navigation_bar/crystal_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';
import 'package:mobileapp/components/home/home.dart';

class MainMenu extends StatefulWidget {
  const MainMenu({super.key});

  @override
  State<MainMenu> createState() => _MainMenuState();
}

class _MainMenuState extends State<MainMenu> {
  var _selectedIndex = 0; //หน้าเริ่มต้น

  final List<Widget> _pages = [
    
    Home(),
    const Center(child: Text("Scan Page",style: TextStyle(fontSize: 24))),
    const Center(child: Text("Notify Page",style: TextStyle(fontSize: 24))),
    const Center(child: Text("Record Page",style: TextStyle(fontSize: 24))),
  ];
  void _onItemTapped(int index){
    setState(() {
      _selectedIndex = index;
    });
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex], //แสดงหน้าแรก
      bottomNavigationBar: CrystalNavigationBar(
        backgroundColor: Colors.purple.withValues(alpha: 0.6),
        items: <CrystalNavigationBarItem>[
          //index 0
          CrystalNavigationBarItem(
            icon: IconlyBold.home,
            selectedColor: Colors.white,
          ),
          //index 1
          CrystalNavigationBarItem(
            icon: IconlyBold.scan,
            selectedColor: Colors.white,
          ),
          //index 2
          CrystalNavigationBarItem(
            icon: IconlyBold.notification,
            selectedColor: Colors.white,
          ),
          //index 3
          CrystalNavigationBarItem(
            icon: IconlyBold.document,
            selectedColor: Colors.white,
          ),
        ],
        onTap:  _onItemTapped,
        currentIndex: _selectedIndex,
        ),
    );
      
  }
}

