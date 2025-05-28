import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:mobileapp/models/project.dart';

class ApiProject{
  static const String baseUrl = 'http://10.0.2.2:3000';

    Future<List<Project>> fetchProjectActivities() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/project/getproject'));

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Project.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load project: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching project: $e');
    }
  }


 Future<void> recordAttendance(String projectId, String qrCodeId) async {
    if (qrCodeId.isEmpty || !RegExp(r'^[A-Za-z0-9]+$').hasMatch(qrCodeId)) {
      throw Exception('QR Code ไม่ถูกต้อง');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/record/activityrecord2'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'project_id': int.parse(projectId),
        'qr_code_id': qrCodeId, 
      }),
    );

    if (response.statusCode == 201) {
      final Map<String, dynamic> data = json.decode(response.body);
      if (data['status'] == 'success') {
        return;
      } else {
        throw Exception('Failed to record attendance: ${data['error']}');
      }
    } else if (response.statusCode == 400) {
      final Map<String, dynamic> data = json.decode(response.body);
      if (data['status'] == 'duplicate') {
        throw Exception('ผู้ใช้นี้ได้บันทึกการเข้าร่วมกิจกรรมนี้ไปแล้ว');
      } else {
        throw Exception('ข้อมูลไม่ถูกต้อง: ${data['error']}');
      }
    } else if (response.statusCode == 404) {
      final Map<String, dynamic> data = json.decode(response.body);
      if (data['code'] == 'USER_NOT_FOUND') {
        throw Exception('ไม่พบข้อมูลผู้ใช้นี้ในระบบ');
      } else if (data['code'] == 'PROJECT_NOT_FOUND') {
        throw Exception('ไม่พบข้อมูลโครงการนี้ในระบบ');
      } else {
        throw Exception('เกิดข้อผิดพลาด: ${data['error']}');
      }
    } else {
      throw Exception('เกิดข้อผิดพลาดในการบันทึกการเข้าร่วม (${response.statusCode})');
    }
  }

  Future<void> joinActivity(String qrCodeData, String userQrCodeId) async {
    if (qrCodeData.isEmpty) {
      throw Exception('QR Code กิจกรรมไม่ถูกต้อง: ข้อมูลว่างเปล่า');
    }

    // ลองแยก projectId จาก URL หรือใช้ qrCodeData โดยตรง
    String projectId = qrCodeData;
    final uri = Uri.tryParse(qrCodeData);
    if (uri != null && uri.queryParameters.containsKey('projectId')) {
      projectId = uri.queryParameters['projectId'] ?? qrCodeData;
    }

    // ตรวจสอบว่า projectId เป็นตัวเลขหรือ string ที่ถูกต้อง
    if (projectId.isEmpty) {
      throw Exception('QR Code กิจกรรมไม่ถูกต้อง: ไม่สามารถแยก projectId ได้');
    }

    print('Sending projectId: $projectId'); // Debug
    print('Sending userQrCodeId: $userQrCodeId'); // Debug

    final response = await http.post(
      Uri.parse('$baseUrl/record/joinactivity'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'qr_code_data': projectId, // ส่ง projectId หรือ qrCodeData
        'user_id': userQrCodeId,
      }),
    );

    if (response.statusCode == 201) {
      final Map<String, dynamic> data = json.decode(response.body);
      if (data['status'] == 'success') {
        return;
      } else {
        throw Exception('Failed to join activity: ${data['error']}');
      }
    } else {
      final Map<String, dynamic> data;
      try {
        data = json.decode(response.body);
      } catch (e) {
        throw Exception('เกิดข้อผิดพลาดในการเข้าร่วมกิจกรรม (${response.statusCode}): ${response.body}');
      }

      if (response.statusCode == 400) {
        if (data['status'] == 'duplicate') {
          throw Exception('คุณได้เข้าร่วมกิจกรรมนี้ไปแล้ว');
        } else if (data['code'] == 'INVALID_MS_ID_LENGTH') {
          throw Exception('รหัสผู้ใช้ยาวเกินกว่าที่กำหนด');
        } else if (data['code'] == 'INVALID_QR_CODE') {
          throw Exception('QR Code กิจกรรมไม่ถูกต้อง: รูปแบบไม่ถูกต้อง');
        } else {
          throw Exception('ข้อมูลไม่ถูกต้อง: ${data['error']}');
        }
      } else if (response.statusCode == 404) {
        if (data['code'] == 'USER_NOT_FOUND') {
          throw Exception('ไม่พบข้อมูลผู้ใช้ในระบบ');
        } else if (data['code'] == 'PROJECT_NOT_FOUND') {
          throw Exception('ไม่พบข้อมูลโครงการในระบบ: projectId=$projectId');
        } else {
          throw Exception('เกิดข้อผิดพลาด: ${data['error']}');
        }
      } else {
        throw Exception('เกิดข้อผิดพลาดในการเข้าร่วมกิจกรรม (${response.statusCode}): ${data['error'] ?? response.body}');
      }
    }
  }
}
