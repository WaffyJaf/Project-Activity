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
  });

  factory User.fromJson(Map<String, dynamic> json) {
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
      'activity_record': activityRecord.map((record) => record.toJson()).toList(),
    };
  }
}

class ActivityRecord {
  final int id;
  final int projectId;
  final String projectName;
  final String msId;
  final DateTime joinedAt;
  final ProjectActivity? projectActivity;

  ActivityRecord({
    required this.id,
    required this.projectId,
    required this.projectName,
    required this.msId,
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
      'joined_at': joinedAt.toIso8601String(),
      'project_activity': projectActivity?.toJson(),
    };
  }
}

class ProjectActivity {
  final String projectName;

  ProjectActivity({
    required this.projectName,
  });

  factory ProjectActivity.fromJson(Map<String, dynamic> json) {
    return ProjectActivity(
      projectName: json['project_name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'project_name': projectName,
    };
  }
}