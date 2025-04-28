import 'package:flutter/material.dart';
import 'package:mobileapp/components/doc/docview.dart';

class Doc extends StatelessWidget {
  const Doc({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: buildAppBar(context),
      body: Docview(),
    );
  }

  AppBar buildAppBar(BuildContext context) {
  return AppBar(
    backgroundColor: Colors.white, // กำหนดพื้นหลังให้เห็นเส้นชัด
    title: const Text(
      "ประวัติการใช้งาน",
      style: TextStyle(
        fontSize: 24,
        color: Color.fromARGB(255, 75, 74, 73),
        fontWeight: FontWeight.normal,
      ),
    ),
    bottom: const PreferredSize(
      preferredSize: Size.fromHeight(1.0), 
      child: Divider(
        color: Colors.grey, 
        thickness: 1,
        height: 1,
      ),
    ),
  );
}

}