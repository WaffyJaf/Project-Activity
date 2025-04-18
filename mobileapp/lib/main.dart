import 'package:flutter/material.dart';
import 'package:mobileapp/main_menu.dart';
import 'package:flutter/services.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ตั้งค่าให้แอปทำงานในโหมดเต็มหน้าจอและล็อก orientation เป็น portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // ตั้งค่าสีของ status bar และ navigation bar 
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark, 
    systemNavigationBarColor: Colors.white, 
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

 
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Menu Example',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Roboto',
        textTheme: const TextTheme(
          bodyLarge: TextStyle(fontSize: 16.0),
          bodyMedium: TextStyle(fontSize: 14.0),
        ),
        
      ),
      
      debugShowCheckedModeBanner: false,
      // หน้าแรกของแอป
      home: const MainMenu(),
    );
  }

}