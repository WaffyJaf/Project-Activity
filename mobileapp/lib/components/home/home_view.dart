import 'package:flutter/material.dart';
import '../../models/activity.dart';
import '../../services/home_api.dart';
import 'package:mobileapp/components/home/detailview.dart';

enum SortOption { newest, oldest, active, expired } // ตัวเลือกการเรียงลำดับ

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  SortOption _sortOption = SortOption.newest; // ค่าเริ่มต้น: ใหม่ไปเก่า

  // ฟังก์ชันเรียงลำดับ activities
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('รายการกิจกรรม',style: TextStyle(fontSize: 16)),
        actions: [
          // ปุ่มเรียงลำดับ
          PopupMenuButton<SortOption>(
            icon: const Icon(Icons.sort),
            onSelected: (SortOption option) {
              setState(() {
                _sortOption = option; // อัปเดตตัวเลือก
              });
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<SortOption>>[
              const PopupMenuItem<SortOption>(
                value: SortOption.newest,
                child: Text('ใหม่ไปเก่า'),
              ),
              const PopupMenuItem<SortOption>(
                value: SortOption.oldest,
                child: Text('เก่าไปใหม่'),
              ),
              const PopupMenuItem<SortOption>(
                value: SortOption.active,
                child: Text('สถานะ: Active'),
              ),
              const PopupMenuItem<SortOption>(
                value: SortOption.expired,
                child: Text('สถานะ: Expired'),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {}); // รีเฟรชข้อมูล
          return;
        },
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

            final activities = _sortActivities(snapshot.data!); // เรียงลำดับ
            return ListView.builder(
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final activity = activities[index];
                print('Image URL: ${activity.imageUrl}');
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
                              print('Image load error: $error');
                              return const Icon(Icons.error);
                            },
                          )
                        : const Icon(Icons.image_not_supported),
                    title: Text(
                      activity.postContent.length > 50
                          ? '${activity.postContent.substring(0, 20)}...'
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
                            color: activity.postStatus.toLowerCase() == 'เปิด' || activity.postStatus.toLowerCase() == 'active'
                              ? Colors.green
                              : Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    //ทายบรรทัด
                    trailing: IconButton(
                      icon: const Icon(Icons.visibility),
                      onPressed: () {
                        // ไปยังหน้า DetailView
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
    );
  }
}