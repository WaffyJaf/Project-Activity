import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobileapp/models/user.dart';
import '../services/login_api.dart';

class ApiService {
  ApiService();
    

  
  Future<User?> getUserByMsId(String msId) async {
    try {
       final baseUrl = await LoginApi.getBaseUrl();
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