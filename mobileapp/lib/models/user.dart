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
    );
  }
}
