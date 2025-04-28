import 'package:flutter/material.dart';

class Docview extends StatefulWidget {
  const Docview({super.key});

  @override
  State<Docview> createState() => _DocviewState();
}

class _DocviewState extends State<Docview> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      


      body: Column(
        children: [
          // ส่วนหัวโฆษณา
          Container(
            margin: const EdgeInsets.fromLTRB(16.0, 15.0, 16.0, 16.0),
            padding: const EdgeInsets.all(12.0),
            decoration: BoxDecoration(
              color: const Color.fromARGB(255, 94, 32, 142),
              borderRadius: BorderRadius.circular(12.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey,
                  spreadRadius: 2,
                  blurRadius: 5,
                  offset: const Offset(0, 3),
                ),
              ],
            ),

            child: Row(
              children: [
                // ส่วนเนื้อหาและปุ่ม
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'การเข้าร่วมกิจกรรม',
                        style: TextStyle(
                          color: Color.fromARGB(255, 255, 255, 255),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'กิจกรรมที่เข้าร่วมไปแล้ว',
                        style: TextStyle(fontSize: 14,
                        color: Color.fromARGB(255, 255, 255, 255),),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {
                          print('กดดูเพิ่มเติม');
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 10,
                          ),
                        ),
                        child: const Text('ดูเพิ่มเติม'),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 100,
                  height: 100,
                  margin: const EdgeInsets.only(left: 12.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    image: const DecorationImage(
                      image:AssetImage('assets/images/post.png' ),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Container(
              margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.3),
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ประวัติการลงทะเบียนกิจกรรม',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                ],
              ),
          ),
          
          
        ],
      ),
    );
  }
}