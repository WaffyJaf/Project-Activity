import 'package:flutter/material.dart';
import 'package:mobileapp/components/home/registeration.dart';
import '../../models/activity.dart';

class DetailView extends StatelessWidget {
  final Activity activity;

  const DetailView({super.key, required this.activity});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'รายละเอียดกิจกรรม',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.deepPurple, Colors.deepPurple],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        elevation: 4,
      ),
      body: Container(
        color: Colors.grey[100],
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image Section
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: activity.imageUrl.isNotEmpty &&
                            Uri.parse(activity.imageUrl).isAbsolute
                        ? Container(
                            decoration: BoxDecoration(
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Image.network(
                              activity.imageUrl,
                              width: double.infinity,
                              height: 400,
                              fit: BoxFit.cover,
                              loadingBuilder: (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return const Center(
                                  child: CircularProgressIndicator(
                                    color: Colors.blueAccent,
                                  ),
                                );
                              },
                              errorBuilder: (context, error, stackTrace) {
                                print('Image load error: $error');
                                return Container(
                                  height: 400,
                                  color: Colors.grey[300],
                                  child: const Icon(
                                    Icons.error,
                                    size: 100,
                                    color: Colors.redAccent,
                                  ),
                                );
                              },
                            ),
                          )
                        : Container(
                            height: 400,
                            color: Colors.grey[300],
                            child: const Icon(
                              Icons.image_not_supported,
                              size: 100,
                              color: Colors.grey,
                            ),
                          ),
                  ),
                  const SizedBox(height: 24),
                  // Content Section
                  Text(
                    activity.postContent,
                    style: const TextStyle(
                      fontFamily: 'Sarabun',
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      height: 1.5,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Divider(color: Colors.grey),
                  const SizedBox(height: 16),
                  // Details Section
                  _buildDetailRow(
                    icon: Icons.location_on,
                    label: 'สถานที่',
                    value: activity.postlocation,
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    icon: Icons.calendar_today,
                    label: 'วันที่',
                    value: activity.formatDate(activity.postDate),
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    icon: Icons.info,
                    label: 'สถานะ',
                    value: activity.postStatus,
                  ),
                  const SizedBox(height: 12),
                  _buildDetailRow(
                    icon: Icons.access_time,
                    label: 'จำนวนชั่วโมง',
                    value: '${activity.posthour} ชั่วโมง',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),

      //ปุ่มลงทะเบียน
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RegistrationPage(activity: activity),
            ),
          );
        },
        label: const Text(
          'ลงทะเบียน',
          style: TextStyle(
            fontFamily: 'Sarabun',
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        icon: const Icon(Icons.person_add),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: Colors.deepPurple,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            '$label: $value',
            style: const TextStyle(
              fontFamily: 'Sarabun',
              fontSize: 14,
              fontWeight: FontWeight.w400,
              color: Colors.black87,
            ),
          ),
        ),
      ],
    );
  }
}