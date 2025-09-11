import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app_links/app_links.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:io';
import 'models/user.dart';
import 'services/login_api.dart';
import 'providers/user_provider.dart';
import 'services/firebase.dart';
import 'main_menu.dart';
import '../providers/notification_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _apiService = LoginApi();
  bool _isLoading = false;
  StreamSubscription? _sub;
  final _appLinks = AppLinks();

  @override
  void initState() {
    super.initState();
    _initDeepLinkListener();
  }

  void _initDeepLinkListener() async {
    _sub = _appLinks.uriLinkStream.listen((Uri? uri) {
      if (uri != null && uri.scheme == 'myapp' && uri.host == 'auth') {
        _handleAuthCallback(uri);
      }
    }, onError: (err) {
      print('Deep link error: $err');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('เกิดข้อผิดพลาดในการจัดการลิงก์ล็อกอิน')),
      );
    });

    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null && initialUri.scheme == 'myapp' && initialUri.host == 'auth') {
      _handleAuthCallback(initialUri);
    }
  }

  void _handleAuthCallback(Uri uri) async {
    final token = uri.queryParameters['token'];
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ล็อกอินล้มเหลว: ไม่ได้รับ token')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      print('กำลังจัดการ token: $token');
      final data = await _apiService.loginWithToken(token);
      print('ข้อมูลจาก loginWithToken: $data');
      final user = User.fromJson(data['user']);
      print('ผู้ใช้: ${user.msId}');

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('ms_id', user.msId);

      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);

      userProvider.clearUser();
      notificationProvider.clearNotifications();
      userProvider.setUser(user);

      final notificationService = NotificationService();
      print('กำลังเริ่มต้น NotificationService...');
      await notificationService.initialize(context);

      final deviceToken = await FirebaseMessaging.instance.getToken();
      if (deviceToken != null) {
        print('กำลังส่ง FCM token ไปยัง backend...');
        await notificationService.sendTokenToBackend(user.msId);
      }
      print('กำลังตั้งค่า token refresh...');
      await notificationService.setupTokenRefresh(user.msId);
      print('กำลังดึงการแจ้งเตือน...');
      await notificationProvider.fetchNotifications(user.msId);

      print('นำทางไปยัง MainMenu');
      Navigator.pushReplacementNamed(context, '/main_menu');
    } catch (e, stackTrace) {
      print('ข้อผิดพลาดในการล็อกอิน: $e');
      print('StackTrace: $stackTrace');
      String errorMessage = 'ล็อกอินล้มเหลว กรุณาลองใหม่';
      if (e.toString().contains('Network')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อ';
      } else if (e.toString().contains('401')) {
        errorMessage = 'token ไม่ถูกต้องหรือไม่ได้รับอนุญาต';
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

  void _loginWithMicrosoft() async {
    const redirectUri = 'http://localhost:3000/auth/microsoft/callback';

    const authUrl = 'https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/authorize?'
        'client_id={CLIENT_ID}&'
        'response_type=code&'
        'redirect_uri={REDIRECT_URI}&'
        'response_mode=query&'
        'scope=openid%20profile%20email%20User.Read&'
        'state=flutter';

    final url = authUrl
        .replaceAll('{TENANT_ID}', dotenv.env['MICROSOFT_TENANT_ID'] ?? '')
        .replaceAll('{CLIENT_ID}', dotenv.env['MICROSOFT_CLIENT_ID'] ?? '')
        .replaceAll('{REDIRECT_URI}', Uri.encodeComponent(redirectUri));

    if (dotenv.env['MICROSOFT_TENANT_ID'] == null || dotenv.env['MICROSOFT_CLIENT_ID'] == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('การกำหนดค่า Microsoft OAuth ไม่ถูกต้อง')),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WebViewPage(
          url: url,
          onAuthCallback: _handleAuthCallback,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color.fromARGB(255, 255, 255, 255),
              Color.fromARGB(255, 83, 8, 130),
              Color.fromARGB(255, 67, 2, 91),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo Section
                Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.asset(
                      'assets/images/logoup.png', 
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                
                const SizedBox(height: 10),
                
                // Welcome Text
                const Text(
                  'ยินดีต้อนรับ',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w300,
                    color: Color.fromARGB(255, 255, 255, 255),
                    letterSpacing: 1.2,
                  ),
                ),
                
                const SizedBox(height: 8),
                
                // Login Title
                const Text(
                  'ลงชื่อเข้าใช้',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                
                const SizedBox(height: 50),
                
                // Login Button or Loading
                _isLoading
                    ? Column(
                        children: [
                          Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(25),
                            ),
                            child: const CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 3,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'กำลังเข้าสู่ระบบ...',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      )
                    : Container(
                        width: double.infinity,
                        height: 60,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.2),
                              blurRadius: 15,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: ElevatedButton.icon(
                          onPressed: _loginWithMicrosoft,
                          icon: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: const Color.fromARGB(255, 63, 3, 112),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Icon(
                              Icons.business,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                          label: const Text(
                            'ล็อกอินด้วย Microsoft 365',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF2D3748),
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF2D3748),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                          ),
                        ),
                      ),
                
                const SizedBox(height: 40),
                
                // Footer Text
                Text(
                  'ระบบกิจกรรม มหาวิทยาลัยพะเยา',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Version or App Info
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'เวอร์ชัน 1.0.0',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}

class WebViewPage extends StatefulWidget {
  final String url;
  final Function(Uri) onAuthCallback;

  const WebViewPage({super.key, required this.url, required this.onAuthCallback});

  @override
  _WebViewPageState createState() => _WebViewPageState();
}

class _WebViewPageState extends State<WebViewPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) async {
            // ตรวจจับ deep link
            if (request.url.startsWith('myapp://auth')) {
              final uri = Uri.parse(request.url);
              widget.onAuthCallback(uri); // ส่งไปยัง _handleAuthCallback
              Navigator.pop(context);
              return NavigationDecision.prevent;
            }
            // ตรวจจับ callback จาก Microsoft
            if (Platform.isAndroid && request.url.startsWith('http://localhost:3000/auth/microsoft/callback')) {
  final uri = Uri.parse(request.url);

  // เช็คว่าเป็น emulator (10.0.2.2) หรือ ip จริง (172.20.10.3)
  final hosts = ['10.0.2.2', '172.20.10.3'];

  for (final host in hosts) {
    final newUri = uri.replace(host: host, port: 3000);
    final client = http.Client();
    try {
      final httpRequest = http.Request('GET', newUri);
      httpRequest.followRedirects = false;

      final streamedResponse = await client.send(httpRequest);
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 300 && response.statusCode < 400) {
        final location = response.headers['location'];
        if (location != null) {
          final redirectUri = Uri.parse(location);
          if (redirectUri.scheme == 'myapp' && redirectUri.host == 'auth') {
            widget.onAuthCallback(redirectUri);
            Navigator.pop(context);
            return NavigationDecision.prevent;
          }
        }
      } else {
        throw Exception('Failed to process callback: ${response.statusCode}');
      }
    } catch (e) {
      // ถ้า host นี้พัง ให้ลอง host ถัดไปแทน
      debugPrint('Error with $host: $e');
      continue;
    } finally {
      client.close();
    }
  }

              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Microsoft Login')),
      body: WebViewWidget(controller: _controller),
    );
  }
}