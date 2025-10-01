import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../styles/colors";

// Telas
import SplashScreen from "../components/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import RegisterOlheiroScreen from "../screens/RegisterOlheiroScreen";
import RegisterInstituicaoScreen from "../screens/RegisterInstituicaoScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
// Telas iniciais
import HomeOlheiroScreen from "../screens/HomeOlheiroScreen";
import HomeInstituicaoScreen from "../screens/HomeInstituicaoScreen";
import HomeResponsavelScreen from "../screens/HomeResponsavelScreen";
// Telas de perfil
import EditProfileOlheiroScreen from "../screens/EditProfileOlheiroScreen";
import EditProfileInstituicaoScreen from "../screens/EditProfileInstituicaoScreen";
// Outras telas
import AtletasScreen from "../screens/AddAtletaScreen";
import AtletaDetailScreen from "../screens/AtletaDetailScreen";
import AgendamentosScreen from "../screens/AgendamentosScreen";
import ConvitesScreen from "../screens/ConvitesScreen";
import NotificacoesScreen from "../screens/NotificacoesScreen";
// Componentes
import CustomDrawerContent from "../components/CustomDrawerContent";
import LoadingScreen from "../components/LoadingScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Componente de ícone reutilizável
const DrawerIcon = ({ icon, color, size = 20 }) => (
  <View style={{ width: 24, alignItems: "center" }}>
    <Text style={{ color: color || colors.textSecondary, fontSize: size }}>
      {icon}
    </Text>
  </View>
);

// Stack de autenticação
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <Stack.Screen name="RegisterOlheiro" component={RegisterOlheiroScreen} />
    <Stack.Screen
      name="RegisterInstituicao"
      component={RegisterInstituicaoScreen}
    />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Drawers
const OlheiroDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: colors.background,
        width: 280,
      },
      drawerActiveTintColor: colors.primary,
      drawerInactiveTintColor: colors.textSecondary,
      drawerLabelStyle: {
        marginLeft: -16,
        fontSize: 15,
      },
    }}
  >
    <Drawer.Screen
      name="HomeOlheiro"
      component={HomeOlheiroScreen}
      options={{
        drawerLabel: "Início",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🏠" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Atletas"
      component={AtletasScreen}
      options={{
        drawerLabel: "Atletas",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="⚽" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Agendamentos"
      component={AgendamentosScreen}
      options={{
        drawerLabel: "Agendamentos",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="📅" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Convites"
      component={ConvitesScreen}
      options={{
        drawerLabel: "Convites",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="✉️" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Notificacoes"
      component={NotificacoesScreen}
      options={{
        drawerLabel: "Notificações",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🔔" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="EditProfile"
      component={EditProfileOlheiroScreen}
      options={{
        drawerLabel: "Editar Perfil",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="👤" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);

const InstituicaoDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: colors.background,
        width: 280,
      },
      drawerActiveTintColor: colors.primary,
      drawerInactiveTintColor: colors.textSecondary,
      drawerLabelStyle: {
        marginLeft: -16,
        fontSize: 15,
      },
    }}
  >
    <Drawer.Screen
      name="HomeInstituicao"
      component={HomeInstituicaoScreen}
      options={{
        drawerLabel: "Início",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🏠" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Atletas"
      component={AtletasScreen}
      options={{
        drawerLabel: "Meus Atletas",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="⚽" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Agendamentos"
      component={AgendamentosScreen}
      options={{
        drawerLabel: "Agendamentos",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="📅" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Convites"
      component={ConvitesScreen}
      options={{
        drawerLabel: "Convites",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="✉️" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Notificacoes"
      component={NotificacoesScreen}
      options={{
        drawerLabel: "Notificações",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🔔" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="EditProfile"
      component={EditProfileInstituicaoScreen}
      options={{
        drawerLabel: "Editar Perfil",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🏫" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);

const ResponsavelDrawer = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        backgroundColor: colors.background,
        width: 280,
      },
      drawerActiveTintColor: colors.primary,
      drawerInactiveTintColor: colors.textSecondary,
      drawerLabelStyle: {
        marginLeft: -16,
        fontSize: 15,
      },
    }}
  >
    <Drawer.Screen
      name="HomeResponsavel"
      component={HomeResponsavelScreen}
      options={{
        drawerLabel: "Início",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🏠" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Atletas"
      component={AtletasScreen}
      options={{
        drawerLabel: "Atletas",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="⚽" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Notificacoes"
      component={NotificacoesScreen}
      options={{
        drawerLabel: "Notificações",
        drawerIcon: ({ color, size }) => (
          <DrawerIcon icon="🔔" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);

// Stack principal para usuários autenticados
const MainStack = ({ userType }) => {
  let DrawerComponent;

  if (userType === "olheiro") {
    DrawerComponent = OlheiroDrawer;
  } else if (userType === "instituicao") {
    DrawerComponent = InstituicaoDrawer;
  } else if (userType === "responsavel") {
    DrawerComponent = ResponsavelDrawer;
  } else {
    DrawerComponent = OlheiroDrawer;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainDrawer" component={DrawerComponent} />
      <Stack.Screen name="AtletaDetail" component={AtletaDetailScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading, userData } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.background,
          text: colors.textPrimary,
          border: colors.inputBorder,
          notification: colors.primary,
        },
      }}
    >
      {isAuthenticated && userData ? (
        <MainStack userType={userData.userType} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
//--