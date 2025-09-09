import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class HoursSummary {
  final String msId;
  final String academicYear;
  final int? term; 
  final double totalHours;

  HoursSummary({
    required this.msId,
    required this.academicYear,
    this.term,
    required this.totalHours,
  });

  factory HoursSummary.fromJson(Map<String, dynamic> json) {
    return HoursSummary(
      msId: json['ms_id'] ?? '',
      academicYear: json['academic_year']?.toString() ?? '',
      term: json['term'] == null ? null : int.tryParse(json['term'].toString()),
      totalHours: double.tryParse(json['total_hours'].toString()) ?? 0.0,
    );
  }
  }

class ApiService {
  final String baseUrl = dotenv.env['BASE_URL'] ?? ''; 

  Future<List<HoursSummary>> getTermSummary(String msId, {String? academicYear, int limit = 10, int offset = 0}) async {
    final uri = Uri.parse('$baseUrl/api/hours/$msId').replace(
      queryParameters: {
        'scope': 'term',
        if (academicYear != null) 'ay': academicYear,
        'limit': limit.toString(),
        'offset': offset.toString(),
      },
    );

    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return (json['data'] as List).map((item) => HoursSummary.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load term summary: ${response.body}');
    }
  }

  Future<List<HoursSummary>> getYearSummary(String msId, {int limit = 10, int offset = 0}) async {
    final uri = Uri.parse('$baseUrl/api/hours/$msId').replace(
      queryParameters: {
        'scope': 'year',
        'limit': limit.toString(),
        'offset': offset.toString(),
      },
    );

    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return (json['data'] as List).map((item) => HoursSummary.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load year summary: ${response.body}');
    }
  }

  Future<List<HoursSummary>> getSixMonthSummary(String msId, {int limit = 10, int offset = 0}) async {
    final uri = Uri.parse('$baseUrl/api/hours/$msId').replace(
      queryParameters: {
        'scope': 'six-month',
        'limit': limit.toString(),
        'offset': offset.toString(),
      },
    );

    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return (json['data'] as List).map((item) => HoursSummary.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load 6-month summary: ${response.body}');
    }
  }

  Future<double> getTotalHours(String msId) async {
  final uri = Uri.parse('$baseUrl/api/hours/$msId').replace(
    queryParameters: {'scope': 'all'},
  );

  final response = await http.get(uri);
  if (response.statusCode == 200) {
    final Map<String, dynamic> json = jsonDecode(response.body);

    // ป้องกัน error ถ้าโครงสร้างไม่ตรง
    final data = json['data'] as Map<String, dynamic>?;

    if (data != null && data['total_hours'] != null) {
      return double.tryParse(data['total_hours'].toString()) ?? 0.0;
    }
    return 0.0;
  } else {
    throw Exception('Failed to load total hours: ${response.body}');
  }
}

}