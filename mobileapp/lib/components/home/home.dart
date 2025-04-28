import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';
import 'package:mobileapp/components/home/home_view.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../services/login_api.dart';
import '../../login.dart';

class Home extends StatelessWidget {
  const Home({super.key});

  void _showUserProfile(BuildContext context, user) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircleAvatar(
                radius: 40,
                backgroundColor: Colors.deepPurple,
                child: Icon(
                  Icons.person,
                  size: 40,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                user.displayName,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'MS ID: ${user.msId}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 10),
              Text(
                'คณะ : ${user.department}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 10),
              Text(
                'Role: ${user.role}',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () async {
                  await LoginApi().clearToken();
                  if (context.mounted) {
                    Provider.of<UserProvider>(context, listen: false).clearUser();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  }
                },
              ),
            ],
          ),
        );
      },
    );
  }

  AppBar buildAppBar(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;
    
    return AppBar(
      // Logo app
      leading: SizedBox(
        child: Image.asset(
          'assets/images/uptop.png',
          width: 200,
          height: 200,
          fit: BoxFit.contain,
        ),
      ),
      centerTitle: true,
      title: const Text(
        "Home",
        style: TextStyle(
          fontSize: 24,
          color: Colors.white,
          fontWeight: FontWeight.normal
        )
      ),
      backgroundColor: const Color.fromARGB(255, 94, 32, 142),
      actions: [
        IconButton(
          icon: const Icon(IconlyBold.profile),
          color: Colors.white,
          onPressed: () => _showUserProfile(context, user),
        )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: buildAppBar(context),
      body: const HomeView(),
    );
  }
}