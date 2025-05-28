import 'package:flutter/material.dart';
import 'package:mobileapp/components/scan/projectlist.dart';

class pjAppbar extends StatelessWidget {
  const pjAppbar({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: buildAppBar(context),
      body: ProjectView(),
    );
  }

  AppBar buildAppBar(BuildContext context) {
  return AppBar(
    backgroundColor: const Color.fromARGB(255, 86, 50, 148), 
    centerTitle: true,
    title: const Text(
      "บันทึกการเข้าร่วม",
      style: TextStyle(
        fontSize: 24,
        color: Color.fromARGB(255, 255, 255, 255),
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