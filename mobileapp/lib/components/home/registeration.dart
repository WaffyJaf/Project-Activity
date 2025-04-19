import 'package:flutter/material.dart';
import '../../models/activity.dart';
import '../../services/home_api.dart';

class RegistrationPage extends StatefulWidget {
  final Activity activity;

  const RegistrationPage({super.key, required this.activity});

  @override
  _RegistrationPageState createState() => _RegistrationPageState();
}

class _RegistrationPageState extends State<RegistrationPage> {
  final _formKey = GlobalKey<FormState>();
  final _studentIdController = TextEditingController();
  final _studentNameController = TextEditingController();
  final _facultyController = TextEditingController();

  Future<void> _register() async {
    if (_formKey.currentState!.validate()) {
      final result = await Apiregis().register(
        postId: widget.activity.postId.toString(), 
        studentId: _studentIdController.text,
        studentName: _studentNameController.text,
        faculty: _facultyController.text,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']),
          backgroundColor:
              result['status'] == 'success' ? Colors.green : Colors.red,
        ),
      );

      if (result['status'] == 'success') {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
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
                      validator: (value) =>
                          value!.isEmpty ? 'กรุณากรอกคณะ' : null,
                    ),

                    //submit
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
                            fontFamily: 'Sarab370un',
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
    _studentIdController.dispose();
    _studentNameController.dispose();
    _facultyController.dispose();
    super.dispose();
  }
}