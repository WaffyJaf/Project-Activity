import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/user_provider.dart';
import 'providers/notification_provider.dart';
import 'login.dart';
import 'main_menu.dart';
import './components/notify/notification_screen.dart';
import 'services/login_api.dart';
import 'services/firebase.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
    print('Firebase initialized successfully');
  } catch (e) {
    print('Firebase initialization error: $e');
    // Optionally, show an error screen or fallback UI
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Set preferred orientations and system UI style here to ensure context stability
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ));

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => UserProvider()),
        ChangeNotifierProvider(create: (context) => NotificationProvider()),
      ],
      child: MaterialApp(
        title: 'Flutter Menu Example',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          fontFamily: 'Roboto',
          textTheme: const TextTheme(
            bodyLarge: TextStyle(fontSize: 16.0),
            bodyMedium: TextStyle(fontSize: 14.0),
          ),
        ),
        debugShowCheckedModeBanner: false,
        initialRoute: '/',
        routes: {
          '/': (context) => const AuthWrapper(),
          '/main_menu': (context) => const MainMenu(),
          '/notifications': (context) => const NotificationScreen(),
        },
        onUnknownRoute: (settings) {
          print('Route ไม่รู้จัก: ${settings.name}');
          return MaterialPageRoute(builder: (context) => const LoginScreen());
        },
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  _AuthWrapperState createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isLoading = true;
  bool _isAuthenticated = false;
  final NotificationService _notificationService = NotificationService();
  final LoginApi _loginApi = LoginApi();

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      print('Starting initialization...');
      // Initialize notification service after widget is built
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        try {
          await _notificationService.initialize(context);
          print('NotificationService initialized');
        } catch (e) {
          print('NotificationService initialization error: $e');
        }
      });

      await _checkAuth();
    } catch (e) {
      print('Initialization error: $e');
      // Optionally, show error to user
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Initialization failed: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _checkAuth() async {
    try {
      final token = await _loginApi.getToken();
      print('Auth token from LoginApi: $token');

      if (token != null && await _loginApi.verifyToken(token)) {
        final userProvider = Provider.of<UserProvider>(context, listen: false);
        final notificationProvider = Provider.of<NotificationProvider>(context, listen: false);

        final user = await _loginApi.getUser();
        if (user != null) {
          userProvider.setUser(user);
          await _notificationService.sendTokenToBackend(user.msId);
          await _notificationService.setupTokenRefresh(user.msId);
          await notificationProvider.fetchNotifications(user.msId);
          setState(() {
            _isAuthenticated = true;
          });
        } else {
          print('Failed to fetch user from backend');
        }
      } else {
        print('No token or invalid token');
      }
    } catch (e) {
      print('Authentication check error: $e');
      // Optionally, show error to user
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Authentication failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return _isAuthenticated ? const MainMenu() : const LoginScreen();
  }
}