class Project {
  final int projectId; 
  final String projectName;
  final DateTime createdDate;
  final String projectStatus;
  final DateTime? approvalDatetime;
  final DateTime? projectDatetime;
  final String? qrCodeData;

  Project({
    required this.projectId,
    required this.projectName,
    required this.createdDate,
    required this.projectStatus,
    this.approvalDatetime,
    this.projectDatetime,
    this.qrCodeData,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      projectId: int.parse(json['project_id'].toString()), 
      projectName: json['project_name'],
      createdDate: DateTime.parse(json['created_date']),
      projectStatus: json['project_status'],
      approvalDatetime: json['approval_datetime'] != null
          ? DateTime.parse(json['approval_datetime'])
          : null,
      projectDatetime: json['project_datetime'] != null
          ? DateTime.parse(json['project_datetime'])
          : null,
      qrCodeData: json['qrCodeData'],
    );
  }
}