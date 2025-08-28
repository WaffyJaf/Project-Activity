import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/activity.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';


class ApiService{
    final String baseUrl = dotenv.env['BASE_URL'] ?? '';

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

  Future<Activity> findActivityByIdFromList(int postId) async {
    final list = await fetchActivities();
    return list.firstWhere(
      (a) => a.postId == postId,
      orElse: () => throw Exception('ไม่พบกิจกรรม id=$postId'),
    );
  }

}

    class Apiregis{
      final String baseUrl = dotenv.env['BASE_URL'] ?? '';
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
            'ms_id': studentId,
            'student_name': studentName,
            'faculty': faculty,
          }),
        );

         final result = jsonDecode(response.body);

          if (response.statusCode == 201) {
            return {
              'status': 'success',
              'message': result['message'] ?? 'ลงทะเบียนสำเร็จ',
            };
          } else if (response.statusCode == 409) {
            // กรณีสมัครซ้ำ
            return {
              'status': 'duplicate',
              'message': result['message'] ?? 'คุณได้ลงทะเบียนกิจกรรมนี้แล้ว',
            };
          } else {
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