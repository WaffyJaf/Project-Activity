import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobileapp/models/record.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  final String baseUrl = dotenv.env['BASE_URL'] ?? ''; 

  Future<List<Registration>> getRegistrationByStudentId(String studentId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/record/regisrecord/$studentId'));
      print('API Response Status: ${response.statusCode}');
      print('API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        print('Parsed Data: $data');
        return data.map((json) => Registration.fromJson(json)).toList();
      } else if (response.statusCode == 404) {
        throw Exception('No registration history found for this student');
      } else {
        throw Exception('Failed to fetch registration history: ${response.statusCode}');
      }
    } catch (e) {
      print('API Error: $e');
      rethrow;
    }
  }

}