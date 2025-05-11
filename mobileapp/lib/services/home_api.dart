import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/activity.dart';


class ApiService{
  static const String baseUrl = 'http://172.20.10.2:3000';

    Future<List<Activity>> fetchActivities() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/event/getevent'));
      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Activity.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load activities: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching activities: $e');
    }
  }
}

class Apiregis{
  static const String baseUrl = 'http://10.0.2.2:3000';

   Future<Map<String, dynamic>> register({
  required String postId,    
  required String studentId, 
  required String studentName, 
  required String faculty,  
}) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/event/regisactivity'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'post_id': int.parse(postId),
        'student_id': studentId,
        'student_name': studentName,
        'faculty': faculty,
      }),
    );

    if (response.statusCode == 201) {
      final result = jsonDecode(response.body);
      return {
        'status': 'success',
        'message': result['message'] ?? 'ลงทะเบียนสำเร็จ',
      };
    } else {
      final result = jsonDecode(response.body);
      return {
        'status': 'error',
        'message': result['message'] ?? 'ลงทะเบียนล้มเหลว',
      };
    }
  } catch (e) {
    return {
      'status': 'error',
      'message': 'เกิดข้อผิดพลาดในการเชื่อมต่อ: $e',
    };
  }
}
}