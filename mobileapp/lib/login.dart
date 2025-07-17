import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/user.dart';
import 'services/login_api.dart';
import 'providers/user_provider.dart';
import 'package:mobileapp/services/firebase.dart';
import 'main_menu.dart';
import '../providers/notification_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _msIdController = TextEditingController();
  final _apiService = LoginApi();
  bool _isLoading = false;

  void _login() async {
    final msId = _msIdController.text.trim();
    if (msId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('กรุณากรอก MS ID')),
      );
      return;
    }

    if (!_isValidMsId(msId)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('MS ID ไม่ถูกต้อง กรุณากรอกอีเมลหรือรหัสนักศึกษา')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      print('เริ่มการล็อกอินสำหรับ msId: $msId');
      final data = await _apiService.login(msId);
      print('ข้อมูลจาก _apiService.login: $data');
      final user = User.fromJson(data['user']);
      print('User ที่แปลงแล้ว: ${user.msId}');
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);

      userProvider.clearUser();
      notificationProvider.clearNotifications();
      userProvider.setUser(user);

      final notificationService = NotificationService();
      print('เริ่มต้น NotificationService...');
      await notificationService.initialize(context);
      print('ส่ง FCM token ไป backend...');
      await notificationService.sendTokenToBackend(user.msId);
      print('ตั้งค่า token refresh...');
      await notificationService.setupTokenRefresh(user.msId);
      print('ดึงการแจ้งเตือน...');
      await notificationProvider.fetchNotifications(user.msId);

      print('นำทางไปยัง MainMenu');
      Navigator.pushReplacementNamed(context, '/main_menu');
    } catch (e, stackTrace) {
      print('ข้อผิดพลาดในการล็อกอิน: $e');
      print('StackTrace: $stackTrace');
      String errorMessage = 'ไม่สามารถล็อกอินได้ กรุณาลองใหม่อีกครั้ง';
      if (e.toString().contains('Network')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อ';
      } else if (e.toString().contains('401')) {
        errorMessage = 'MS ID ไม่ถูกต้องหรือไม่มีอยู่ในระบบ';
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  bool _isValidMsId(String msId) {
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    final studentIdRegex = RegExp(r'^\d{8}$');
    return emailRegex.hasMatch(msId) || studentIdRegex.hasMatch(msId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.deepPurple, Color.fromARGB(255, 198, 144, 249)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'ลงชื่อเข้าใช้',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 40),
              TextField(
                controller: _msIdController,
                decoration: InputDecoration(
                  labelText: 'MS ID (อีเมลหรือรหัสนักศึกษา)',
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.8),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  prefixIcon: const Icon(Icons.person),
                  errorText: _msIdController.text.isEmpty
                      ? null
                      : (_isValidMsId(_msIdController.text) ? null : 'รูปแบบ MS ID ไม่ถูกต้อง'),
                ),
                keyboardType: TextInputType.text,
                onChanged: (value) => setState(() {}),
              ),
              const SizedBox(height: 20),
              _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : ElevatedButton(
                      onPressed: _login,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Text(
                        'ล็อกอิน',
                        style: TextStyle(
                          color: Colors.deepPurple,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _msIdController.dispose();
    super.dispose();
  }
}