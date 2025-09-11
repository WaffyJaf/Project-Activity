import 'dart:convert';
import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobileapp/services/login_api.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import '../providers/notification_provider.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_app_badger/flutter_app_badger.dart';
import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final LoginApi _loginApi = LoginApi();
 late final String _backendUrl;

  NotificationService() {
    _backendUrl = _getBackendUrl();
  }

  String _getBackendUrl() {
    // URL สำหรับแต่ละกรณี (ตั้งค่าใน .env)
    final emulatorUrl = dotenv.env['EMULATOR_BACKENDFIREBASE_URL'] ?? 'http://10.0.2.2:3000';
    final deviceUrl   = dotenv.env['DEVICE_BACKENDFIREBASE_URL']   ?? 'http://172.20.10.3:3000';
    final iosUrl      = dotenv.env['IOS_BACKEND_URL']      ?? 'http://localhost:3000';

    if (Platform.isAndroid) {
      return emulatorUrl; // emulator Android ใช้ 10.0.2.2
    } else if (Platform.isIOS) {
      return iosUrl; // iOS simulator ใช้ localhost ได้เลย
    } else {
      return deviceUrl; // อุปกรณ์จริง ใช้ IP LAN ของ dev
    }
  }

  Future<void> _requestNotificationPermissionIfNeeded() async {
    if (kIsWeb) return;

    if (Platform.isAndroid) {
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      if (androidInfo.version.sdkInt >= 33) {
        final status = await Permission.notification.status;
        if (!status.isGranted) {
          await Permission.notification.request();
        }
      }
    }
  }

  // Initialize badge count and check if badge is supported
  Future<void> _initializeBadge() async {
    try {
      bool isSupported = await FlutterAppBadger.isAppBadgeSupported();
      if (!isSupported) {
        print('Badge not supported on this device');
        return;
      }
      final prefs = await SharedPreferences.getInstance();
      int savedBadgeCount = prefs.getInt('badgeCount') ?? 0;
      badgeCount = savedBadgeCount;
      FlutterAppBadger.updateBadgeCount(badgeCount);
    } catch (e) {
      print('Error initializing badge: $e');
    }
  }

  int badgeCount = 0;

  // Update badge count and persist it
  Future<void> updateBadgeCount() async {
    try {
      bool isSupported = await FlutterAppBadger.isAppBadgeSupported();
      if (!isSupported) {
        print('Badge not supported, skipping update');
        return;
      }
      badgeCount++;
      await FlutterAppBadger.updateBadgeCount(badgeCount);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('badgeCount', badgeCount);
      print('Updated badge count: $badgeCount');
    } catch (e) {
      print('Error updating badge count: $e');
    }
  }

  // Clear badge count and persist the change
  Future<void> clearBadge() async {
    try {
      bool isSupported = await FlutterAppBadger.isAppBadgeSupported();
      if (!isSupported) {
        print('Badge not supported, skipping clear');
        return;
      }
      badgeCount = 0;
      await FlutterAppBadger.removeBadge();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('badgeCount', 0);
      print('Cleared badge count');
    } catch (e) {
      print('Error clearing badge: $e');
    }
  }

  // Initialize Firebase Messaging
  Future<void> initialize(BuildContext context) async {
    try {
      print('เริ่มต้น Firebase Messaging...');
      await _requestNotificationPermissionIfNeeded();
      await _initializeBadge();

      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      print('สถานะการอนุญาตแจ้งเตือน: ${settings.authorizationStatus}');

      // ดึง FCM token ครั้งแรก
      String? initialToken = await _getFcmTokenWithRetry();
      print('Initial FCM Token: $initialToken');

      // ตั้งค่าการรับการแจ้งเตือนใน foreground
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        print('ได้รับการแจ้งเตือนใน foreground: ${message.notification?.title}');
        // อัปเดต badge count
        updateBadgeCount();
        // อัปเดตการแจ้งเตือนใน Provider
        final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);
        notificationProvider.fetchNotifications(context.read<UserProvider>().user!.msId);
      });

      // ตั้งค่าการจัดการเมื่อเปิดแอปจาก background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        print('เปิดแอปจาก background: ${message.notification?.title}');
        Navigator.pushNamed(context, '/notifications');
        clearBadge();
      });

      // ตั้งค่า background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // ตรวจสอบการแจ้งเตือนเมื่อเปิดแอปจากสถานะ terminated
      RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
      if (initialMessage != null) {
        print('เปิดแอปจาก terminated: ${initialMessage.notification?.title}');
        Navigator.pushNamed(context, '/notifications');
        clearBadge();
      }
    } catch (e) {
      print('ข้อผิดพลาดในการเริ่มต้น Firebase Messaging: $e');
    }
  }

  // ส่ง FCM token ไปยัง backend
  Future<void> sendTokenToBackend(String msId) async {
    try {
      print('กำลังส่ง FCM token สำหรับ msId: $msId');
      String? fcmToken = await _getFcmTokenWithRetry();
      print('FCM Token to send: $fcmToken');

      if (fcmToken == null || fcmToken.isEmpty) {
        print('Error: ไม่สามารถดึง FCM token ได้');
        return;
      }

      String? authToken = await _loginApi.getToken();
      print('Auth Token: $authToken');
      if (authToken == null || authToken.isEmpty) {
        print('Error: ไม่พบ authentication token');
        return;
      }

      final body = jsonEncode({
        'ms_id': msId,
        'token': fcmToken,
      });
      print('Request body: $body');

      final response = await http.post(
        Uri.parse(_backendUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: body,
      ).timeout(const Duration(seconds: 10), onTimeout: () {
        print('Request to $_backendUrl timed out');
        throw TimeoutException('Request to $_backendUrl timed out');
      });

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('ส่ง FCM token ไป backend สำเร็จ');
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('fcm_token', fcmToken);
      } else {
        print('ส่ง FCM token ล้มเหลว: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('ข้อผิดพลาดในการส่ง FCM token: $e');
    }
  }

  // เมธอดช่วยในการ retry ดึง FCM token
  Future<String?> _getFcmTokenWithRetry({int retries = 3, Duration delay = const Duration(seconds: 2)}) async {
    for (int i = 0; i < retries; i++) {
      try {
        String? token = await _firebaseMessaging.getToken();
        if (token != null && token.isNotEmpty) {
          print('ดึง FCM token สำเร็จครั้งที่ ${i + 1}: $token');
          return token;
        }
        print('FCM token เป็น null หรือว่าง, ลองครั้งที่ ${i + 1}/$retries');
        await Future.delayed(delay);
      } catch (e) {
        print('ข้อผิดพลาดในการดึง FCM token ครั้งที่ ${i + 1}: $e');
      }
    }
    print('ล้มเหลวในการดึง FCM token หลังจากลอง $retries ครั้ง');
    return null;
  }

  // จัดการ token refresh
  Future<void> setupTokenRefresh(String msId) async {
    try {
      _firebaseMessaging.onTokenRefresh.listen((String newToken) async {
        print('FCM token ถูกรีเฟรช: $newToken');
        final prefs = await SharedPreferences.getInstance();
        final oldToken = prefs.getString('fcm_token');
        if (oldToken != newToken) {
          print('Token เปลี่ยนแปลง, ส่ง token ใหม่ไป backend');
          await sendTokenToBackend(msId);
        } else {
          print('Token ไม่เปลี่ยนแปลง, ข้ามการส่ง');
        }
      });
    } catch (e) {
      print('ข้อผิดพลาดในการตั้งค่า token refresh: $e');
    }
  }

  // ดึง FCM token ปัจจุบัน
  Future<String?> getFcmToken() async {
    try {
      String? token = await _firebaseMessaging.getToken();
      print('เรียก getFcmToken: $token');
      return token;
    } catch (e) {
      print('ข้อผิดพลาดในการดึง FCM token: $e');
      return null;
    }
  }
}

// Handler สำหรับ background message
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('จัดการ background message: ${message.notification?.title}');
}