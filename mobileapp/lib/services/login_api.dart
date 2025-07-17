import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobileapp/models/user.dart';

class LoginApi {
  static const String baseUrl = 'http://10.0.2.2:3000';

  // ล็อกอินด้วย ms_id
  Future<Map<String, dynamic>> login(String msId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'ms_id': msId}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('ms_id', msId); // บันทึก ms_id
        return data;
      } else {
        throw Exception('ล็อกอินล้มเหลว: ${response.body}');
      }
    } catch (e) {
      throw Exception('ข้อผิดพลาด: $e');
    }
  }

  // ดึง ms_id
  Future<String?> getMsId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('ms_id');
  }

  // อัปเดตเมธอดอื่นๆ ให้เหมือนเดิม
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

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('ms_id'); 
  }

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