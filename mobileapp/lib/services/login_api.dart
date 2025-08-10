import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobileapp/models/user.dart';
import 'dart:io';


class LoginApi {
 String get baseUrl {
    String defaultUrl = Platform.isAndroid ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    return dotenv.env['BASE_URL'] ?? defaultUrl;
  }

  // ล็อกอินด้วย token
  Future<Map<String, dynamic>> loginWithToken(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/verify?token=$token'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to verify token: ${response.statusCode}');
      }
    } catch (e) {
      print('Error in loginWithToken: $e');
      rethrow;
    }
  }

  // ดึง ms_id
  Future<String?> getMsId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('ms_id');
  }

  // เช็คอินด้วย qrCodeId
  Future<Map<String, dynamic>> checkIn(String qrCodeId) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      throw Exception('ไม่พบ token');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/check-in'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'qrCodeId': qrCodeId}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('เช็คอินล้มเหลว: ${response.body}');
    }
  }

  // ดึง token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ล้าง token
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('ms_id');
  }

  // ตรวจสอบ token
  Future<bool> verifyToken(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/verify-token'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // ดึงข้อมูลผู้ใช้
  Future<User?> getUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        print('⛔️ ไม่มี token ใน getUser');
        return null;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('✅ ดึงข้อมูล user สำเร็จ: $data');
        return User.fromJson(data);
      } else {
        print('⛔️ ดึงข้อมูล user ไม่สำเร็จ: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      print('❌ Exception ใน getUser: $e');
      return null;
    }
  }
}