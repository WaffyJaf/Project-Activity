import 'dart:convert';
import 'package:http/http.dart' as http;
import '../services/login_api.dart'; // ใช้ baseUrl + token กลาง

class Apiregis {
  Apiregis(); // ← แก้ชื่อ constructor ให้ตรงกับชื่อคลาส

  Future<Map<String, dynamic>> register({
    required String postId,
    required String studentId,
    required String studentName,
    required String faculty,
  }) async {
    try {
      // ตรวจ postId ให้เป็นตัวเลขก่อน
      final pid = int.tryParse(postId);
      if (pid == null) {
        return {
          'status': 'error',
          'message': 'postId ไม่ใช่ตัวเลขที่ถูกต้อง',
        };
      }

      final baseUrl = await LoginApi.getBaseUrl();
      final token = await LoginApi().getToken();

      // ถ้า endpoint ต้องการ JWT
      final headers = <String, String>{
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final body = jsonEncode({
        'post_id': pid,            // ↔ ตรวจให้ตรงกับ backend (post_id หรือ postId)
        'ms_id': studentId,
        'student_name': studentName,
        'faculty': faculty,
      });

      final response = await http
          .post(
            Uri.parse('$baseUrl/event/regisactivity'),
            headers: headers,
            body: body,
          )
          .timeout(const Duration(seconds: 15));

      // debug ช่วยตรวจ
      // print('REGIS status=${response.statusCode} body=${response.body}');

      final result = response.body.isNotEmpty ? jsonDecode(response.body) : {};

      if (response.statusCode == 201) {
        return {
          'status': 'success',
          'message': result['message'] ?? 'ลงทะเบียนสำเร็จ',
        };
      } else if (response.statusCode == 409) {
        return {
          'status': 'duplicate',
          'message': result['message'] ?? 'คุณได้ลงทะเบียนกิจกรรมนี้แล้ว',
        };
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        return {
          'status': 'auth_error',
          'message': result['message'] ?? 'ไม่ได้รับอนุญาต (ตรวจ token/Authorization)',
        };
      } else {
        return {
          'status': 'error',
          'message': result['message'] ?? 'ลงทะเบียนล้มเหลว: ${response.statusCode}',
        };
      }
    } on FormatException catch (e) {
      // กรณี response ไม่ใช่ JSON
      return {
        'status': 'error',
        'message': 'รูปแบบข้อมูลตอบกลับไม่ถูกต้อง: $e',
      };
    } on Exception catch (e) {
      return {
        'status': 'error',
        'message': 'เกิดข้อผิดพลาดในการเชื่อมต่อ: $e',
      };
    }
  }
}
