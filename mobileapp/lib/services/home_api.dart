import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/activity.dart';


class ApiService{
  static const String baseUrl = 'http://localhost:3000/event/getevent';

    Future<List<Activity>> fetchActivities() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/activities'));
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