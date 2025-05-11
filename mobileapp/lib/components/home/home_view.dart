import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../models/activity.dart';
import '../../services/home_api.dart';
import 'detailview.dart';
import '../qr_code/qr_code_screen.dart';

enum SortOption { newest, oldest, active, expired }

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  SortOption _sortOption = SortOption.newest;

  // Function for sorting activities based on the selected sort option
  List<Activity> _sortActivities(List<Activity> activities) {
    switch (_sortOption) {
      case SortOption.newest:
        return activities
          ..sort((a, b) => DateTime.parse(b.postDate).compareTo(DateTime.parse(a.postDate)));
      case SortOption.oldest:
        return activities
          ..sort((a, b) => DateTime.parse(a.postDate).compareTo(DateTime.parse(b.postDate)));
      case SortOption.active:
        return activities
          ..sort((a, b) => a.postStatus == 'active' ? -1 : 1);
      case SortOption.expired:
        return activities
          ..sort((a, b) => a.postStatus == 'expired' ? -1 : 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    return RefreshIndicator(
      onRefresh: () async {
        setState(() {}); // รีเฟรชข้อมูล
      },
      child: Column(
        children: [
          // ปุ่มแสดง QR Code
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: ElevatedButton.icon(
              onPressed: () {
                if (user == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please log in')),
                  );
                  return;
                }
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const QrCodeStudent()),
                );
              },
              icon: const Icon(Icons.qr_code),
              label: const Text('Show My QR Code'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.deepPurple,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
              ),
            ),
          ),
          // ตัวเลือกการเรียงลำดับใน AppBar
          Padding(
            padding: const EdgeInsets.all(0),
            child: Align(
              alignment: Alignment.centerRight, 
              child: DropdownButton<SortOption>(
                value: _sortOption,
                onChanged: (SortOption? newValue) {
                  setState(() {
                    _sortOption = newValue!;
                  });
                },
                items: SortOption.values.map((SortOption option) {
                  return DropdownMenuItem<SortOption>(
                    value: option,
                    child: Text(
                      option == SortOption.newest
                          ? 'ใหม่สุด'
                          : option == SortOption.oldest
                              ? 'เก่าสุด'
                              : option == SortOption.active
                                  ? 'เปิดอยู่'
                                  : 'ปิด',
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          // รายการกิจกรรม
          Expanded(
            child: FutureBuilder<List<Activity>>(
              future: ApiService().fetchActivities(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No activities found'));
                }

                final activities = _sortActivities(snapshot.data!);
                return ListView.builder(
                  itemCount: activities.length,
                  itemBuilder: (context, index) {
                    final activity = activities[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                      child: ListTile(
                        leading: activity.imageUrl.isNotEmpty && Uri.parse(activity.imageUrl).isAbsolute
                            ? Image.network(
                                activity.imageUrl,
                                width: 50,
                                height: 50,
                                fit: BoxFit.cover,
                                loadingBuilder: (context, child, loadingProgress) {
                                  if (loadingProgress == null) return child;
                                  return const CircularProgressIndicator();
                                },
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    width: 50,
                                    height: 50,
                                    color: Colors.grey[300],
                                    child: const Icon(Icons.image_not_supported),
                                  );
                                },
                              )
                            : Container(
                                width: 50,
                                height: 50,
                                color: Colors.grey[300],
                                child: const Icon(Icons.image_not_supported),
                              ),
                        title: Text(
                          activity.postContent.length > 50
                              ? '${activity.postContent.substring(0, 18)}...'
                              : activity.postContent,
                          style: const TextStyle(fontFamily: 'Sarabun', fontSize: 16),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'วันที่: ${activity.formatDate(activity.postDate)}',
                              style: const TextStyle(fontFamily: 'Sarabun', fontSize: 14),
                            ),
                            Text(
                              'สถานะ: ${activity.postStatus}',
                              style: TextStyle(
                                fontFamily: 'Sarabun',
                                fontSize: 14,
                                color: activity.postStatus.toLowerCase() == 'active'
                                    ? Colors.green
                                    : Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.visibility),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => DetailView(activity: activity),
                              ),
                            );
                          },
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
