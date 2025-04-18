class Activity {
  final int postId;
  final String postContent;
  final String postDate;
  final String postStatus;
  final String imageUrl;

  Activity({
    required this.postId,
    required this.postContent,
    required this.postDate,
    required this.postStatus,
    required this.imageUrl,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      postId: json['post_id'] ?? json['id'] ?? 0,
      postContent: json['post_content'] ?? json['content'] ?? '',
      postDate: json['post_date'] ?? json['date'] ?? '',
      postStatus: json['post_status'] ?? json['status'] ?? '',
      imageUrl: json['image_url'] ?? json['img'] ?? '',
    );
  }
}