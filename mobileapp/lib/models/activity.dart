import 'package:intl/intl.dart';

class Activity {
  final int postId;
  final String postContent;
  final String postDate;
  final String postStatus;
  final String imageUrl;
  final String postlocation;
  final String posthour;

  Activity({
    required this.postId,
    required this.postContent,
    required this.postDate,
    required this.postStatus,
    required this.imageUrl,
    required this.postlocation,
    required this.posthour,
  });

factory Activity.fromJson(Map<String, dynamic> json) {
  const String baseUrl = 'http://10.0.2.2:3000';
  String rawUrl = json['imageUrl'] ?? json['imge_url'] ?? json['img'] ?? '';
  String fullUrl = rawUrl.startsWith('http') ? rawUrl : '$baseUrl$rawUrl';

  return Activity(
    postId: json['post_id'] ?? json['id'] ?? 0,
    postContent: (json['post_content'] ?? json['content'] ?? '').toString(),
    postDate: (json['post_datetime'] ?? json['date'] ?? '').toString(),
    postStatus: (json['post_status'] ?? json['status'] ?? '').toString(),
    postlocation: (json['location'] ?? json['location_post'] ?? '').toString(), 
    posthour: (json['hours'] ?? json['hour_post'] ?? '').toString(), 
    imageUrl: fullUrl,
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
      registerId: json['register_id'],
      studentId: json['student_id'],
      studentName: json['student_name'],
      faculty: json['faculty'],
      projectName: json['project_name'],
      event: json['event'] != null ? Activity.fromJson(json['event']) : null,
    );
  }
}