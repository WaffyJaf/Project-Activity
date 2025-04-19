import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';
import 'package:mobileapp/components/home/home_view.dart';


class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: buildAppBar(context),
      body: HomeView(),
    );
  }

  AppBar buildAppBar(BuildContext context){
    return AppBar(
      //โลโก้app
      leading: SizedBox(
        child: Image.asset('assets/images/uptop.png',
        width: 200,
        height: 200,
        fit: BoxFit.contain,
        ),
      ),

      centerTitle: true,
      title: const Text("Home",
      style: TextStyle(
        fontSize: 24,
        color: Colors.white,
        fontWeight: FontWeight.normal
      )),
      backgroundColor: Colors.deepPurple,
      actions: [IconButton(
        icon: Icon(IconlyBold.profile),
        color: Colors.white,
        onPressed:() => (),
        )],
    );

  }
}