import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/activity.dart';
import '../services/login_api.dart';  // ← ใช้ baseUrl กลาง

class ApiService {
  Future<List<Activity>> fetchActivities() async {
    try {
      final baseUrl = await LoginApi.getBaseUrl();
      final response = await http
          .get(Uri.parse('$baseUrl/event/getevent'))
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Activity.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load activities: ${response.statusCode} - ${response.body}');
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
