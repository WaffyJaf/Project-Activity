import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobileapp/models/record.dart';
import 'package:mobileapp/models/user.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000'; 

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

  Future<User?> getUserByMsId(String msId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/record/$msId'));

      if (response.statusCode == 200) {
        final jsonData = jsonDecode(response.body);
        return User.fromJson(jsonData);
      } else if (response.statusCode == 404) {
        throw Exception('User not found');
      } else {
        throw Exception('Failed to fetch user: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching user $msId: $e');
      rethrow;
    }
  }
}