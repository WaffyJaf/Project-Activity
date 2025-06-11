import 'package:intl/intl.dart';

class Activity {
  final int postId;
  final String postContent;
  final String postDate;
  final String postlocation;
  final String posthour;

  Activity({
    required this.postId,
    required this.postContent,
    required this.postDate,
    required this.postlocation,
    required this.posthour,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      postId: json['post_id'] ?? 0,
      postContent: json['content']?.toString() ?? '',
      postDate: json['datetime']?.toString() ?? '',
      postlocation: json['location']?.toString() ?? '',
      posthour: json['hours']?.toString() ?? '',
    );
  }

  String formatDate(String dateString) {
    try {
      final dateTime = DateTime.parse(dateString).toUtc();
      final thaiTime = dateTime.add(const Duration(hours: 7));

      final formatter = DateFormat('d MMM yyyy HH:mm น.');
      final thaiYear = thaiTime.year + 543;

      String formattedDate = formatter.format(thaiTime);
      formattedDate = formattedDate.replaceFirst(
        thaiTime.year.toString(),
        thaiYear.toString(),
      );

      return formattedDate;
    } catch (e) {
      print('Date format error: $e');
      return dateString;
    }
  }
}

class Registration {
  final String registerId;
  final String studentId;
  final String studentName;
  final String faculty;
  final String projectName;
  final Activity? event;

  Registration({
    required this.registerId,
    required this.studentId,
    required this.studentName,
    required this.faculty,
    required this.projectName,
    this.event,
  });

  factory Registration.fromJson(Map<String, dynamic> json) {
    return Registration(
      registerId: json['register_id']?.toString() ?? '',
      studentId: json['student_id']?.toString() ?? '',
      studentName: json['student_name']?.toString() ?? '',
      faculty: json['faculty']?.toString() ?? '',
      projectName: json['project_name']?.toString() ?? 'Unknown Project',
      event: json['event'] != null ? Activity.fromJson(json['event']) : null,
    );
  }
}