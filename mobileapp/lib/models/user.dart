import 'package:intl/intl.dart';

class User {
  final int? id;
  final String msId;
  final String givenName;
  final String surname;
  final String jobTitle;
  final String department;
  final String displayName;
  final String role;
  final String qrCodeId;
  final String createdAt;
  final int totalActivityHours;
  final List<ActivityRecord> activityRecord;

  User({
    this.id,
    required this.msId,
    required this.givenName,
    required this.surname,
    required this.jobTitle,
    required this.department,
    required this.displayName,
    required this.role,
    required this.qrCodeId,
    required this.createdAt,
    required this.activityRecord,
    required this.totalActivityHours,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    print('User JSON: $json'); // ตรวจสอบ JSON ที่ได้รับ
    return User(
      id: json['id'] != null ? json['id'] as int : null,
      msId: json['ms_id'] ?? '',
      givenName: json['givenName'] ?? '',
      surname: json['surname'] ?? '',
      jobTitle: json['jobTitle'] ?? '',
      department: json['department'] ?? '',
      displayName: json['displayName'] ?? '',
      role: json['role'] ?? '',
      qrCodeId: json['qrCodeId'] ?? '',
      createdAt: json['created_at'] ?? '',
      totalActivityHours: (json['totalActivityHours'] as num?)?.toInt() ?? 0,
      activityRecord: (json['activity_record'] as List? ?? [])
          .map((record) => ActivityRecord.fromJson(record))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ms_id': msId,
      'givenName': givenName,
      'surname': surname,
      'jobTitle': jobTitle,
      'department': department,
      'displayName': displayName,
      'role': role,
      'qrCodeId': qrCodeId,
      'created_at': createdAt,
      'totalActivityHours': totalActivityHours,
      'activity_record': activityRecord.map((record) => record.toJson()).toList(),
    };
  }
}

class ActivityRecord {
  final int id;
  final int projectId;
  final String projectName;
  final String msId;
  final int hours; // <-- แก้ตรงนี้
  final bool hasEvaluation;
  final String? evaluationFormUrl;
  final DateTime joinedAt;
  final ProjectActivity? projectActivity;

  ActivityRecord({
    required this.id,
    required this.projectId,
    required this.projectName,
    required this.msId,
    required this.hours,
    required this.hasEvaluation,
    this.evaluationFormUrl,
    required this.joinedAt,
    this.projectActivity,
  });

  String get formattedJoinedAt => DateFormat('dd/MM/yyyy HH:mm').format(joinedAt);

  factory ActivityRecord.fromJson(Map<String, dynamic> json) {
    return ActivityRecord(
      id: json['id'] as int,
      projectId: json['project_id'] as int,
      projectName: json['project_name'] as String,
      msId: json['ms_id'] as String,
      hours: (json['hours'] as num?)?.toInt() ?? 0,
      hasEvaluation: json['has_evaluation'] as bool? ?? false,
      evaluationFormUrl: json['evaluation_form_url'] as String?,
      joinedAt: DateTime.parse(json['joined_at'] as String),
      projectActivity: json['project_activity'] != null
          ? ProjectActivity.fromJson(json['project_activity'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'project_id': projectId,
      'project_name': projectName,
      'ms_id': msId,
      'hours': hours,
      'has_evaluation': hasEvaluation,
      'evaluation_form_url': evaluationFormUrl,
      'joined_at': joinedAt.toIso8601String(),
      'project_activity': projectActivity?.toJson(),
    };
  }
}

class ProjectActivity {
  final String projectName;
  final bool hasEvaluation;
  final String? evaluationFormUrl;
  final String hours;

  ProjectActivity({
    required this.projectName,
    required this.hasEvaluation,
    required this.hours,
    this.evaluationFormUrl,
  });

  factory ProjectActivity.fromJson(Map<String, dynamic> json) {
    print('Parsing ProjectActivity: $json');
    return ProjectActivity(
      projectName: json['project_name'] as String,
      hasEvaluation: json['has_evaluation'] is int
          ? (json['has_evaluation'] as int) == 1
          : (json['has_evaluation'] as bool? ?? false),
      evaluationFormUrl: json['evaluation_form_url'] as String?,
      hours: json['hours']?.toString() ?? '0',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'project_name': projectName,
      'has_evaluation': hasEvaluation,
      'evaluation_form_url': evaluationFormUrl,
      'hours': hours,
    };
  }
}
