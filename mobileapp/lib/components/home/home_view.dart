import 'package:flutter/material.dart';
import '../../models/activity.dart';
import '../../services/home_api.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home Page'), 
      ),


      body: FutureBuilder<List<Activity>>( 
        future: ApiService().fetchActivities(), // ฟังก์ชันดึงข้อมูลจาก API
        builder: (context, snapshot) {

          // ระหว่างกำลังโหลดข้อมูล
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator()); // แสดงวงกลมโหลด
          } 
          // ถ้าเกิดข้อผิดพลาด
          else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}')); // แสดงข้อความ error
          } 
          // ถ้าไม่มีข้อมูลกลับมา
          else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No activities found')); // แสดงข้อความไม่มีข้อมูล
          }

          
          final activities = snapshot.data!;
          return ListView.builder(
            itemCount: activities.length, // จำนวนรายการทั้งหมด
            itemBuilder: (context, index) {
              final activity = activities[index]; // ข้อมูลแต่ละรายการ
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16), // margin ของ Card
                child: ListTile(
                  leading: activity.imageUrl.isNotEmpty 
                      ? Image.network(
                          activity.imageUrl,
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.error), 
                        )
                      : const Icon(Icons.image_not_supported), // ถ้าไม่มีรูป
                  title: Text(activity.postContent), // เนื้อหากิจกรรม
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Date: ${activity.postDate}'), // วันที่กิจกรรม
                      Text('Status: ${activity.postStatus}'), // สถานะกิจกรรม
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}