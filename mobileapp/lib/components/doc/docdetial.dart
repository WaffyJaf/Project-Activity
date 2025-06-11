import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/user.dart';
import '../../providers/user_provider.dart';
import '../../services/recorduser_api.dart';

enum SortOption { newest, oldest }

class ActivityMoreDetail extends StatefulWidget {
  const ActivityMoreDetail({super.key});

  @override
  State<ActivityMoreDetail> createState() => _ActivityMoreDetailState();
}

class _ActivityMoreDetailState extends State<ActivityMoreDetail> {
  late Future<void> _fetchFuture;
  SortOption _sortOption = SortOption.newest;
  final _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _fetchActivities();
  }

  void _fetchActivities() {
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final msId = userProvider.user?.msId ?? ''; 
    print('Fetching activities for msId: $msId');
    _fetchFuture = _apiService.getUserByMsId(msId).then((user) {
      if (user != null) {
        userProvider.setUser(user);
      } else {
        userProvider.setError('User not found');
      }
    }).catchError((e) {
      userProvider.setError(e.toString());
    });
  }

  List<ActivityRecord> _sortActivities(List<ActivityRecord> activities) {
    return activities
      ..sort((a, b) {
        switch (_sortOption) {
          case SortOption.newest:
            return b.joinedAt.compareTo(a.joinedAt); // Newest first
          case SortOption.oldest:
            return a.joinedAt.compareTo(b.joinedAt); // Oldest first
        }
      });
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);

    if (userProvider.user == null) {
      return const Scaffold(
        body: Center(child: Text('กรุณาเข้าสู่ระบบ')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'กิจกรรมที่เข้าร่วมไปแล้ว',
           style: const TextStyle(fontSize: 22 , color: Colors.white),
        ),
        backgroundColor: const Color.fromARGB(255, 94, 32, 142),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          userProvider.setLoading(true);
          _fetchActivities();
          await _fetchFuture;
          userProvider.setLoading(false);
        },
        child: Column(
          children: [
            // Sorting dropdown
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
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
                        option == SortOption.newest ? 'ใหม่สุด' : 'เก่าสุด',
                        style: const TextStyle(fontFamily: 'Sarabun'),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            // Activity list
            Expanded(
              child: FutureBuilder<void>(
                future: _fetchFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting || userProvider.isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (userProvider.error != null) {
                    return Center(child: Text('ข้อผิดพลาด: ${userProvider.error}'));
                  } else if (userProvider.user == null || userProvider.user!.activityRecord.isEmpty) {
                    return const Center(child: Text('ไม่พบประวัติการเข้าร่วมกิจกรรม'));
                  }

                  final activities = _sortActivities(userProvider.user!.activityRecord);
                  return ListView.builder(
                    itemCount: activities.length,
                    itemBuilder: (context, index) {
                      final activity = activities[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                        child: ListTile(
                          leading: const Icon(Icons.event),
                          title: Text(
                            activity.projectName,
                            style: const TextStyle(fontFamily: 'Sarabun', fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'รหัสโปรเจกต์: ${activity.projectId}',
                                style: const TextStyle(fontFamily: 'Sarabun', fontSize: 14),
                              ),
                              Text(
                                'วันที่เข้าร่วม: ${activity.formattedJoinedAt}',
                                style: const TextStyle(fontFamily: 'Sarabun', fontSize: 14),
                              ),
                            ],
                          ),
                          onTap: () {
                            // TODO: Implement navigation to specific activity detail screen
                          },
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}