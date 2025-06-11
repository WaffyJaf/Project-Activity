import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/activity.dart';
import '../../services/home_api.dart';
import '../../providers/user_provider.dart';

class RegistrationPage extends StatefulWidget {
  final Activity activity;

  const RegistrationPage({super.key, required this.activity});

  @override
  _RegistrationPageState createState() => _RegistrationPageState();
}

class _RegistrationPageState extends State<RegistrationPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _studentIdController;
  late TextEditingController _studentNameController;
  late TextEditingController _facultyController;

  @override
  void initState() {
    super.initState();
    // กำหนดค่าเริ่มต้นให้ตัวควบคุมโดยใช้ข้อมูลจาก UserProvider
    final user = Provider.of<UserProvider>(context, listen: false).user;
    _studentIdController = TextEditingController(text: user?.msId ?? '');
    _studentNameController = TextEditingController(text: user?.displayName ?? '');
    _facultyController = TextEditingController(text: user?.department ?? '');
  }

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่
      final user = Provider.of<UserProvider>(context, listen: false).user;
      if (user == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      // เรียก API เพื่อลงทะเบียน
      final result = await Apiregis().register(
        postId: widget.activity.postId.toString(),
        studentId: _studentIdController.text,
        studentName: _studentNameController.text,
        faculty: _facultyController.text,
      );

      // แสดงผลลัพธ์การลงทะเบียน
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']),
          backgroundColor:
              result['status'] == 'success' ? Colors.green : Colors.red,
        ),
      );

      // กลับไปหน้าก่อนหน้าหากลงทะเบียนสำเร็จ
      if (result['status'] == 'success') {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'ลงทะเบียนกิจกรรม',
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
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.activity.postContent.length > 50
                          ? 'ลงทะเบียน ${widget.activity.postContent.substring(0, 20)}...'
                          : widget.activity.postContent,
                      style: const TextStyle(
                        fontFamily: 'Sarabun',
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _studentIdController,
                      decoration: const InputDecoration(
                        labelText: 'รหัสนักศึกษา',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.badge),
                      ),
                      readOnly: true, // ทำให้ช่องนี้เป็นแบบอ่านอย่างเดียว
                      validator: (value) =>
                          value!.isEmpty ? 'กรุณากรอกรหัสนักศึกษา' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _studentNameController,
                      decoration: const InputDecoration(
                        labelText: 'ชื่อ-นามสกุล',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.person),
                      ),
                      readOnly: true, // ทำให้ช่องนี้เป็นแบบอ่านอย่างเดียว
                      validator: (value) =>
                          value!.isEmpty ? 'กรุณากรอกชื่อ-นามสกุล' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _facultyController,
                      decoration: const InputDecoration(
                        labelText: 'คณะ',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.school),
                      ),
                      readOnly: true, // ทำให้ช่องนี้เป็นแบบอ่านอย่างเดียว
                      validator: (value) =>
                          value!.isEmpty ? 'กรุณากรอกคณะ' : null,
                    ),
                    const SizedBox(height: 24),
                    Center(
                      child: ElevatedButton(
                        onPressed: _register,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color.fromARGB(255, 110, 9, 204),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'ยืนยันการลงทะเบียน',
                          style: TextStyle(
                            fontFamily: 'Sarabun',
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    // ล้างตัวควบคุมเมื่อหน้าไม่ใช้งาน
    _studentIdController.dispose();
    _studentNameController.dispose();
    _facultyController.dispose();
    super.dispose();
  }
}