# Projeto AtletaApp - Aplicativo de Gestão de Atletas

Este documento contém o código-fonte completo do aplicativo React Native com Expo para gestão de atletas, juntamente com instruções detalhadas para a integração com o Firebase.

## Visão Geral do Projeto

O AtletaApp é um aplicativo móvel desenvolvido em React Native com Expo, projetado para conectar instituições esportivas, olheiros e responsáveis por atletas. Ele oferece funcionalidades como:

*   **Autenticação de Usuários:** Login e registro para diferentes perfis (instituição, olheiro, responsável).
*   **Gestão de Atletas (Instituição):** Cadastro de novos atletas, gerenciamento de métricas (gols, assistências, passes, etc.) e início de processos de transferência.
*   **Painel do Olheiro:** Visualização de atletas em destaque por região.
*   **Área do Responsável:** Upload e gerenciamento de mídias (vídeos e fotos) do atleta, com a possibilidade de destacar uma mídia.
*   **Termos e Condições:** Tela para aceitação obrigatória dos termos de uso.

## Estrutura do Projeto

A estrutura de pastas do projeto segue as melhores práticas para aplicativos React Native:

```
AtletaApp/
├── assets/
│   └── logo.png
├── src/
│   ├── components/
│   ├── config/
│   │   └── firebaseConfig.js
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── InstitutionNavigator.js
│   │   ├── MainTabNavigator.js
│   │   ├── ResponsibleNavigator.js
│   │   └── ScoutNavigator.js
│   ├── screens/
│   │   ├── AddAthleteScreen.js
│   │   ├── AthleteDetailScreen.js
│   │   ├── AuthScreen.js
│   │   ├── HomeScreen.js
│   │   ├── InstitutionDashboardScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ManageAthleteMediaScreen.js
│   │   ├── ManageAthletesScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── ResponsibleDashboardScreen.js
│   │   ├── ScoutDashboardScreen.js
│   │   ├── SearchScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── TermsAndConditionsScreen.js
│   │   ├── UpdateAthleteMetricsScreen.js
│   │   └── UploadMediaScreen.js
│   └── utils/
│       └── firebaseUtils.js
└── App.js
```

## Configuração Inicial do Projeto Expo

Para configurar e executar o projeto localmente, siga os passos abaixo:

1.  **Instalar Node.js e npm:** Certifique-se de ter o Node.js (versão 16 ou superior) e o npm instalados em sua máquina.
2.  **Instalar Expo CLI:** Se ainda não tiver, instale o Expo CLI globalmente:
    ```bash
    npm install -g expo-cli
    ```
3.  **Criar o Projeto (já feito):**  Você pode clonar o repositório ou usar o código fornecido.

5.  **Instalar Dependências:** As dependências já foram instaladas durante a criação do projeto. Caso precise reinstalar, execute:
    ```bash
    npm install
    ```
6.  **Instalar Dependências Específicas do Expo:**
    ```bash
    npx expo install react-native-screens react-native-safe-area-context expo-checkbox expo-image-picker
    ```
7.  **Instalar Dependências de Navegação:**
    ```bash
    npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-native-picker/picker
    ```
8.  **Instalar Firebase SDK:**
    ```bash
    npm install firebase
    ```

## Integração com Firebase

O Firebase será utilizado para autenticação, banco de dados (Firestore) e armazenamento de mídias (Storage).

### 1. Configuração do Projeto Firebase

1.  **Crie um Projeto Firebase:**
    *   Acesse o [Console do Firebase](https://console.firebase.google.com/).
    *   Clique em 

"Adicionar projeto" e siga as instruções.
    *   Dê um nome ao seu projeto (ex: `nahio-app`).

2.  **Adicione um Aplicativo Web ao seu Projeto Firebase:**
    *   No console do seu projeto, clique no ícone `</>` (Web) para adicionar um aplicativo web.
    *   Registre seu aplicativo e copie o objeto de configuração do Firebase. Ele será parecido com isto:

    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

3.  **Atualize `src/config/firebaseConfig.js`:**
    *   Substitua os placeholders no arquivo `src/config/firebaseConfig.js` com as suas credenciais do Firebase.

    ```javascript
    // src/config/firebaseConfig.js
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';
    import { getStorage } from 'firebase/storage';

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    export { app, auth, db, storage };
    ```

### 2. Configuração de Autenticação

1.  **Habilitar Provedores de Autenticação:**
    *   No console do Firebase, vá em `Authentication` > `Sign-in method`.
    *   Habilite o provedor `Email/Password`.

2.  **Uso no Aplicativo (`src/utils/firebaseUtils.js`):**
    *   O arquivo `firebaseUtils.js` contém funções para registro e login de usuários, além de obter o perfil do usuário no Firestore.

    ```javascript
    // src/utils/firebaseUtils.js
    import { auth, db } from "../config/firebaseConfig";
    import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
    import { doc, setDoc, getDoc } from "firebase/firestore";

    export const registerUser = async (email, password, userName, userRole) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: userName,
          email: email,
          role: userRole, // 'institution', 'scout', 'responsible'
          createdAt: new Date(),
        });
        return { success: true, user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };

    export const loginUser = async (email, password) => {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };

    export const logoutUser = async () => {
      try {
        await signOut(auth);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };

    export const getUserRole = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          return userDoc.data().role;
        } else {
          console.log("No such document!");
          return null;
        }
      } catch (error) {
        console.error("Error getting user role:", error);
        return null;
      }
    };
    ```

### 3. Configuração do Firestore (Banco de Dados)

1.  **Criar Banco de Dados Firestore:**
    *   No console do Firebase, vá em `Firestore Database`.
    *   Clique em `Criar banco de dados` e escolha o modo `Iniciar em modo de produção` (você pode ajustar as regras de segurança depois).
    *   Escolha a localização do seu servidor.

2.  **Regras de Segurança (Exemplo Básico):**
    *   Para começar, você pode usar regras básicas que permitem leitura e escrita autenticada. **ATENÇÃO:** Estas regras são para desenvolvimento e devem ser revisadas para produção.

    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```

3.  **Estrutura de Dados (Exemplo):**
    *   **`users` coleção:** Armazena informações de perfil de usuário (nome, email, função).
        *   Documento ID: `user.uid`
        *   Campos: `name`, `email`, `role` (`institution`, `scout`, `responsible`), `createdAt`.
    *   **`athletes` coleção:** Armazena informações dos atletas.
        *   Documento ID: gerado automaticamente ou `athleteId`
        *   Campos: `name`, `birthDate`, `position`, `institutionId`, `responsibleEmail`, `metrics` (sub-coleção ou mapa), `media` (sub-coleção ou mapa).

### 4. Configuração do Cloud Storage (Armazenamento de Mídias)

1.  **Criar Cloud Storage:**
    *   No console do Firebase, vá em `Storage`.
    *   Clique em `Começar` e siga as instruções.

2.  **Regras de Segurança (Exemplo Básico):**
    *   Para começar, você pode usar regras básicas que permitem leitura e escrita autenticada. **ATENÇÃO:** Estas regras são para desenvolvimento e devem ser revisadas para produção.

    ```
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        match /{allPaths=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
    ```

3.  **Uso no Aplicativo (`src/screens/UploadMediaScreen.js`):**
    *   A lógica de upload de mídia precisará ser implementada usando o `getStorage` do Firebase e a função `uploadBytes` ou `uploadBytesResumable`.

    ```javascript
    // Exemplo de como seria a função de upload (a ser integrada no handleUpload)
    import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

    const uploadMedia = async (uri, athleteId, mediaType) => {
      const storage = getStorage();
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = uri.substring(uri.lastIndexOf("/") + 1);
      const storageRef = ref(storage, `athletes/${athleteId}/${mediaType}/${filename}`);

      try {
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        return { success: true, url: downloadURL };
      } catch (error) {
        return { success: false, error: error.message };
      }
    };
    ```

## Código-Fonte do Aplicativo

A seguir, o código-fonte completo de cada arquivo JavaScript do projeto.

### `App.js`
```javascript
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppNavigator />
  );
}
```

### `src/navigation/AppNavigator.js`
```javascript
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import MainTabNavigator from './MainTabNavigator';
import InstitutionNavigator from './InstitutionNavigator';
import ScoutNavigator from './ScoutNavigator';
import ResponsibleNavigator from './ResponsibleNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole(null); // Caso o documento do usuário não exista
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Ou uma tela de carregamento
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? (userRole === 'institution' ? 'InstitutionFlow' : userRole === 'scout' ? 'ScoutFlow' : userRole === 'responsible' ? 'ResponsibleFlow' : 'MainApp') : 'Login'}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro' }} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ title: 'Termos e Condições' }} />
          </>
        ) : (
          <>
            {userRole === 'institution' && (
              <Stack.Screen name="InstitutionFlow" component={InstitutionNavigator} options={{ headerShown: false }} />
            )}
            {userRole === 'scout' && (
              <Stack.Screen name="ScoutFlow" component={ScoutNavigator} options={{ headerShown: false }} />
            )}
            {userRole === 'responsible' && (
              <Stack.Screen name="ResponsibleFlow" component={ResponsibleNavigator} options={{ headerShown: false }} />
            )}
            {/* Fallback para usuários logados sem role específica ou role desconhecida */}
            {(!userRole || (userRole !== 'institution' && userRole !== 'scout' && userRole !== 'responsible')) && (
              <Stack.Screen name="MainApp" component={MainTabNavigator} options={{ headerShown: false }} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### `src/navigation/MainTabNavigator.js`
```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importe as telas que serão usadas nas abas
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ScoutDashboardScreen from '../screens/ScoutDashboardScreen'; // Importa a tela do painel do olheiro

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ScoutDashboard') { // Adiciona ícone para o painel do olheiro
            iconName = focused ? 'eye' : 'eye-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Oculta o cabeçalho padrão para as telas de aba
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="ScoutDashboard" component={ScoutDashboardScreen} options={{ title: 'Olheiro' }} /> {/* Adiciona a tela do painel do olheiro */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
```

### `src/navigation/InstitutionNavigator.js`
```javascript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InstitutionDashboardScreen from '../screens/InstitutionDashboardScreen';
import AddAthleteScreen from '../screens/AddAthleteScreen';
import ManageAthletesScreen from '../screens/ManageAthletesScreen';
import AthleteDetailScreen from '../screens/AthleteDetailScreen';
import UpdateAthleteMetricsScreen from '../screens/UpdateAthleteMetricsScreen';

const InstitutionStack = createNativeStackNavigator();

const InstitutionNavigator = () => {
  return (
    <InstitutionStack.Navigator initialRouteName="InstitutionDashboard">
      <InstitutionStack.Screen name="InstitutionDashboard" component={InstitutionDashboardScreen} options={{ title: 'Painel da Instituição' }} />
      <InstitutionStack.Screen name="AddAthlete" component={AddAthleteScreen} options={{ title: 'Adicionar Atleta' }} />
      <InstitutionStack.Screen name="ManageAthletes" component={ManageAthletesScreen} options={{ title: 'Gerenciar Atletas' }} />
      <InstitutionStack.Screen name="AthleteDetail" component={AthleteDetailScreen} options={{ title: 'Detalhes do Atleta' }} />
      <InstitutionStack.Screen name="UpdateAthleteMetrics" component={UpdateAthleteMetricsScreen} options={{ title: 'Atualizar Métricas' }} />
    </InstitutionStack.Navigator>
  );
};

export default InstitutionNavigator;
```

### `src/navigation/ScoutNavigator.js`
```javascript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScoutDashboardScreen from '../screens/ScoutDashboardScreen';
import AthleteDetailScreen from '../screens/AthleteDetailScreen';

const ScoutStack = createNativeStackNavigator();

const ScoutNavigator = () => {
  return (
    <ScoutStack.Navigator initialRouteName="ScoutDashboard">
      <ScoutStack.Screen name="ScoutDashboard" component={ScoutDashboardScreen} options={{ title: 'Painel do Olheiro' }} />
      <ScoutStack.Screen name="AthleteDetail" component={AthleteDetailScreen} options={{ title: 'Detalhes do Atleta' }} />
    </ScoutStack.Navigator>
  );
};

export default ScoutNavigator;
```

### `src/navigation/ResponsibleNavigator.js`
```javascript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ResponsibleDashboardScreen from '../screens/ResponsibleDashboardScreen';
import ManageAthleteMediaScreen from '../screens/ManageAthleteMediaScreen';
import UploadMediaScreen from '../screens/UploadMediaScreen';

const ResponsibleStack = createNativeStackNavigator();

const ResponsibleNavigator = () => {
  return (
    <ResponsibleStack.Navigator initialRouteName="ResponsibleDashboard">
      <ResponsibleStack.Screen name="ResponsibleDashboard" component={ResponsibleDashboardScreen} options={{ title: 'Painel do Responsável' }} />
      <ResponsibleStack.Screen name="ManageAthleteMedia" component={ManageAthleteMediaScreen} options={{ title: 'Gerenciar Mídias do Atleta' }} />
      <ResponsibleStack.Screen name="UploadMedia" component={UploadMediaScreen} options={{ title: 'Upload de Mídia' }} />
    </ResponsibleStack.Navigator>
  );
};

export default ResponsibleNavigator;
```

### `src/screens/LoginScreen.js`
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { loginUser } from '../utils/firebaseUtils';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const { success, error } = await loginUser(email, password);

    if (success) {
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      // A navegação para a tela correta será gerenciada pelo AppNavigator
      // que escutará as mudanças de estado de autenticação do Firebase.
    } else {
      Alert.alert('Erro de Login', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Bem-vindo de volta!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Alert.alert('Esqueceu a senha?', 'Funcionalidade a ser implementada.')}>
        <Text style={styles.linkText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default LoginScreen;
```

### `src/screens/RegisterScreen.js`
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { registerUser } from '../utils/firebaseUtils';
import { Picker } from '@react-native-picker/picker';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('scout'); // Default role for registration

  const handleRegister = async () => {
    if (name === '' || email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const { success, error } = await registerUser(email, password, name, userRole);

    if (success) {
      Alert.alert('Sucesso', 'Conta criada com sucesso! Por favor, aceite os termos e condições.');
      navigation.navigate('TermsAndConditions');
    } else {
      Alert.alert('Erro de Registro', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Crie sua conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <View style={styles.roleSelection}>
        <Text style={styles.roleLabel}>Tipo de Usuário:</Text>
        <Picker
          selectedValue={userRole}
          style={styles.picker}
          onValueChange={(itemValue) => setUserRole(itemValue)}
        >
          <Picker.Item label="Olheiro" value="scout" />
          <Picker.Item label="Responsável" value="responsible" />
          <Picker.Item label="Instituição" value="institution" />
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  roleSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default RegisterScreen;
```

### `src/screens/TermsAndConditionsScreen.js`
```javascript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';

const TermsAndConditionsScreen = ({ navigation }) => {
  const [isChecked, setChecked] = useState(false);

  const handleAccept = () => {
    if (isChecked) {
      Alert.alert(
        'Confirmação',
        'Você aceita os termos e condições?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', onPress: () => navigation.navigate('MainApp') }, // Navegar para a tela inicial após aceitar
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert('Aviso', 'Você deve aceitar os termos e condições para continuar.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Termos e Condições de Uso</Text>
      <ScrollView style={styles.termsContainer}>
        <Text style={styles.termsText}>
          Bem-vindo ao nosso aplicativo! Ao acessar ou usar nossos serviços, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Por favor, leia-os atentamente.

          1. Aceitação dos Termos
          Ao criar uma conta, fazer login ou usar qualquer parte do serviço, você concorda com estes Termos de Uso e com nossa Política de Privacidade. Se você não concordar com todos os termos e condições deste acordo, você não poderá acessar o site ou usar quaisquer serviços.

          2. Elegibilidade
          Você deve ter pelo menos 13 anos de idade para usar este serviço. Ao usar o serviço, você declara e garante que tem o direito, autoridade e capacidade de entrar neste acordo e de cumprir todos os termos e condições aqui estabelecidos.

          3. Sua Conta
          Você é responsável por manter a confidencialidade de sua conta e senha e por restringir o acesso ao seu computador, e você concorda em aceitar a responsabilidade por todas as atividades que ocorram sob sua conta ou senha.

          4. Conteúdo do Usuário
          Você é o único responsável pelo conteúdo que você publica, carrega, vincula ou de outra forma disponibiliza através do serviço. Você concorda que não publicará conteúdo que seja ilegal, difamatório, obsceno, pornográfico, abusivo, ameaçador, assediador ou que viole os direitos de propriedade intelectual de terceiros.

          5. Rescisão
          Podemos rescindir ou suspender seu acesso ao nosso serviço imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.

          6. Alterações nos Termos
          Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso de pelo menos 30 dias antes que quaisquer novos termos entrem em vigor. O que constitui uma alteração material será determinado a nosso exclusivo critério.

          7. Contato
          Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco.
        </Text>
      </ScrollView>
      <View style={styles.checkboxContainer}>
        <Checkbox
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? '#007bff' : undefined}
        />
        <Text style={styles.checkboxLabel}>Eu li e aceito os Termos e Condições de Uso</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAccept}>
        <Text style={styles.buttonText}>Aceitar e Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  termsContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TermsAndConditionsScreen;
```

### `src/screens/HomeScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Tela Inicial</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default HomeScreen;
```

### `src/screens/SearchScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SearchScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Tela de Busca</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default SearchScreen;
```

### `src/screens/ProfileScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Tela de Perfil</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default ProfileScreen;
```

### `src/screens/NotificationsScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Tela de Notificações</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default NotificationsScreen;
```

### `src/screens/SettingsScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Tela de Configurações</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default SettingsScreen;
```

### `src/screens/InstitutionDashboardScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const InstitutionDashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel da Instituição</Text>
      <Button
        title="Adicionar Atleta"
        onPress={() => navigation.navigate('AddAthlete')}
      />
      <Button
        title="Gerenciar Atletas"
        onPress={() => navigation.navigate('ManageAthletes')}
      />
      {/* Aqui aparecerão os atletas mais destacados e seguidos por olheiros */}
      <Text style={styles.subtitle}>Atletas em Destaque</Text>
      {/* Lista de atletas em destaque */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
});

export default InstitutionDashboardScreen;
```

### `src/screens/AddAthleteScreen.js`
```javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

const AddAthleteScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [position, setPosition] = useState('');
  const [emailResponsible, setEmailResponsible] = useState('');

  const handleAddAthlete = () => {
    if (name === '' || birthDate === '' || position === '' || emailResponsible === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    Alert.alert(
      'Confirmação',
      `Deseja adicionar o atleta ${name}? Uma senha provisória será enviada para ${emailResponsible}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => {
            console.log('Atleta adicionado:', { name, birthDate, position, emailResponsible });
            // Lógica para adicionar atleta e enviar senha provisória
            Alert.alert('Sucesso', 'Atleta adicionado com sucesso! Senha provisória enviada ao responsável.');
            navigation.goBack();
          }
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Adicionar Novo Atleta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome Completo do Atleta"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Data de Nascimento (DD/MM/AAAA)"
        value={birthDate}
        onChangeText={setBirthDate}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Posição (Ex: Atacante, Zagueiro)"
        value={position}
        onChangeText={setPosition}
      />
      <TextInput
        style={styles.input}
        placeholder="Email do Responsável"
        keyboardType="email-address"
        autoCapitalize="none"
        value={emailResponsible}
        onChangeText={setEmailResponsible}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddAthlete}>
        <Text style={styles.buttonText}>Adicionar Atleta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddAthleteScreen;
```

### `src/screens/ManageAthletesScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const DUMMY_ATHLETES = [
  { id: '1', name: 'João Silva', position: 'Atacante' },
  { id: '2', name: 'Maria Souza', position: 'Meio-campo' },
  { id: '3', name: 'Pedro Santos', position: 'Zagueiro' },
];

const ManageAthletesScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.athleteItem} onPress={() => navigation.navigate('AthleteDetail', { athleteId: item.id, athleteName: item.name })}>
      <Text style={styles.athleteName}>{item.name}</Text>
      <Text style={styles.athletePosition}>{item.position}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Atletas</Text>
      <FlatList
        data={DUMMY_ATHLETES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  athleteItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  athleteName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  athletePosition: {
    fontSize: 16,
    color: '#666',
  },
});

export default ManageAthletesScreen;
```

### `src/screens/AthleteDetailScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';

const AthleteDetailScreen = ({ route, navigation }) => {
  const { athleteId, athleteName } = route.params;

  // Dados mockados para o atleta
  const athleteData = {
    id: athleteId,
    name: athleteName,
    position: 'Atacante',
    birthDate: '15/05/2000',
    metrics: {
      goals: 25,
      assists: 10,
      passes: 800,
      tackles: 15,
      yellowCards: 3,
      redCards: 0,
    },
    videos: [
      { id: 'v1', title: 'Melhores Momentos 2023', url: 'https://example.com/video1.mp4', featured: true },
      { id: 'v2', title: 'Treino de Finalização', url: 'https://example.com/video2.mp4', featured: false },
    ],
    photos: [
      { id: 'p1', title: 'Jogo contra o rival', url: 'https://example.com/photo1.jpg', featured: false },
      { id: 'p2', title: 'Comemoração de gol', url: 'https://example.com/photo2.jpg', featured: false },
    ],
  };

  const handleTransfer = () => {
    Alert.alert(
      'Confirmar Transferência',
      `Deseja iniciar o processo de transferência para ${athleteName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => Alert.alert('Sucesso', 'Processo de transferência iniciado com sucesso!') },
      ],
      { cancelable: false }
    );
  };

  const handleUpdateMetrics = () => {
    navigation.navigate('UpdateAthleteMetrics', { athleteId: athleteData.id, athleteName: athleteData.name, currentMetrics: athleteData.metrics });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{athleteData.name}</Text>
      <Text style={styles.subtitle}>Posição: {athleteData.position}</Text>
      <Text style={styles.subtitle}>Data de Nascimento: {athleteData.birthDate}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas do Atleta</Text>
        {Object.entries(athleteData.metrics).map(([key, value]) => (
          <Text key={key} style={styles.metricItem}>- {key.charAt(0).toUpperCase() + key.slice(1)}: {value}</Text>
        ))}
        <Button title="Atualizar Métricas" onPress={handleUpdateMetrics} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mídias (Vídeos)</Text>
        {athleteData.videos.map((video) => (
          <View key={video.id} style={styles.mediaItem}>
            <Text>{video.title} {video.featured && '(Destaque)'}</Text>
            {/* Implementar player de vídeo ou link */}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mídias (Fotos)</Text>
        {athleteData.photos.map((photo) => (
          <View key={photo.id} style={styles.mediaItem}>
            <Text>{photo.title} {photo.featured && '(Destaque)'}</Text>
            {/* Implementar exibição de imagem */}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.transferButton} onPress={handleTransfer}>
        <Text style={styles.transferButtonText}>Iniciar Processo de Transferência</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metricItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  mediaItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  transferButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  transferButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AthleteDetailScreen;
```

### `src/screens/UpdateAthleteMetricsScreen.js`
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

const UpdateAthleteMetricsScreen = ({ route, navigation }) => {
  const { athleteId, athleteName, currentMetrics } = route.params;
  const [metrics, setMetrics] = useState(currentMetrics || {
    goals: '',
    assists: '',
    passes: '',
    tackles: '',
    yellowCards: '',
    redCards: '',
  });

  const handleMetricChange = (key, value) => {
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      [key]: value,
    }));
  };

  const handleUpdateMetrics = () => {
    Alert.alert(
      'Confirmar Atualização',
      `Deseja atualizar as métricas para ${athleteName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => {
            console.log(`Métricas atualizadas para ${athleteName}:`, metrics);
            // Lógica para salvar as métricas no Firebase
            Alert.alert('Sucesso', 'Métricas atualizadas com sucesso!');
            navigation.goBack();
          }
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Atualizar Métricas de {athleteName}</Text>

      {Object.keys(metrics).map((key) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(metrics[key])}
            onChangeText={(text) => handleMetricChange(key, text)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleUpdateMetrics}>
        <Text style={styles.buttonText}>Salvar Métricas</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    width: 120,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdateAthleteMetricsScreen;
```

### `src/screens/ScoutDashboardScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const DUMMY_ATHLETES_BY_REGION = {
  'Sudeste': [
    { id: 'a1', name: 'Lucas Fernandes', position: 'Meio-campo', region: 'Sudeste' },
    { id: 'a2', name: 'Mariana Costa', position: 'Atacante', region: 'Sudeste' },
  ],
  'Sul': [
    { id: 'a3', name: 'Rafael Guedes', position: 'Zagueiro', region: 'Sul' },
  ],
  'Nordeste': [
    { id: 'a4', name: 'Camila Lima', position: 'Goleira', region: 'Nordeste' },
  ],
};

const ScoutDashboardScreen = ({ navigation }) => {
  const renderAthleteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.athleteItem}
      onPress={() => navigation.navigate('AthleteDetail', { athleteId: item.id, athleteName: item.name })}
    >
      <Text style={styles.athleteName}>{item.name}</Text>
      <Text style={styles.athletePosition}>{item.position} - {item.region}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Olheiro</Text>
      <Text style={styles.subtitle}>Atletas em Destaque por Região</Text>
      {
        Object.keys(DUMMY_ATHLETES_BY_REGION).map((region) => (
          <View key={region} style={styles.regionSection}>
            <Text style={styles.regionTitle}>{region}</Text>
            <FlatList
              data={DUMMY_ATHLETES_BY_REGION[region]}
              keyExtractor={(item) => item.id}
              renderItem={renderAthleteItem}
              scrollEnabled={false} // Para que o ScrollView pai funcione
            />
          </View>
        ))
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  regionSection: {
    marginBottom: 20,
  },
  regionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  athleteItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  athleteName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  athletePosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default ScoutDashboardScreen;
```

### `src/screens/ResponsibleDashboardScreen.js`
```javascript
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ResponsibleDashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Responsável</Text>
      <Text style={styles.subtitle}>Atleta: [Nome do Atleta]</Text>
      <Button
        title="Gerenciar Mídias (Vídeos e Fotos)"
        onPress={() => navigation.navigate('ManageAthleteMedia')}
      />
      {/* Aqui pode aparecer a mídia em destaque do atleta */}
      <Text style={styles.subtitle}>Mídia em Destaque</Text>
      {/* Exibir a mídia destacada aqui */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
});

export default ResponsibleDashboardScreen;
```

### `src/screens/ManageAthleteMediaScreen.js`
```javascript
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_MEDIA = [
  { id: 'v1', type: 'video', title: 'Melhores Momentos 2023', url: 'https://example.com/video1.mp4', featured: true },
  { id: 'v2', type: 'video', title: 'Treino de Finalização', url: 'https://example.com/video2.mp4', featured: false },
  { id: 'p1', type: 'photo', title: 'Jogo contra o rival', url: 'https://example.com/photo1.jpg', featured: false },
  { id: 'p2', type: 'photo', title: 'Comemoração de gol', url: 'https://example.com/photo2.jpg', featured: false },
];

const ManageAthleteMediaScreen = ({ navigation }) => {
  const [mediaList, setMediaList] = useState(DUMMY_MEDIA);

  const handleSetFeatured = (id, type) => {
    Alert.alert(
      'Definir como Destaque',
      `Deseja definir esta ${type} como destaque? Apenas uma mídia pode ser destacada.`, 
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => {
            const updatedList = mediaList.map(item => 
              item.id === id ? { ...item, featured: true } : { ...item, featured: false }
            );
            setMediaList(updatedList);
            Alert.alert('Sucesso', `${type} definida como destaque!`);
          }
        },
      ],
      { cancelable: false }
    );
  };

  const renderMediaItem = ({ item }) => (
    <View style={styles.mediaItem}>
      {item.type === 'photo' ? (
        <Image source={{ uri: item.url }} style={styles.mediaThumbnail} />
      ) : (
        <Ionicons name="videocam-outline" size={40} color="#007bff" style={styles.mediaThumbnail} />
      )}
      <View style={styles.mediaInfo}>
        <Text style={styles.mediaTitle}>{item.title}</Text>
        <Text style={styles.mediaType}>{item.type === 'video' ? 'Vídeo' : 'Foto'}</Text>
      </View>
      <View style={styles.mediaActions}>
        {item.featured ? (
          <Ionicons name="star" size={24} color="gold" />
        ) : (
          <TouchableOpacity onPress={() => handleSetFeatured(item.id, item.type)}>
            <Ionicons name="star-outline" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Mídias do Atleta</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={() => navigation.navigate('UploadMedia')}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Adicionar Nova Mídia</Text>
      </TouchableOpacity>
      <FlatList
        data={mediaList}
        keyExtractor={(item) => item.id}
        renderItem={renderMediaItem}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  list: {
    width: '100%',
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  mediaThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaInfo: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaType: {
    fontSize: 14,
    color: '#666',
  },
  mediaActions: {
    marginLeft: 10,
  },
});

export default ManageAthleteMediaScreen;
```

### `src/screens/UploadMediaScreen.js`
```javascript
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const UploadMediaScreen = ({ navigation }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    if (selectedMedia) {
      Alert.alert(
        'Confirmação de Upload',
        'Deseja realmente fazer o upload desta mídia?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => {
              console.log('Mídia para upload:', selectedMedia);
              // Lógica para upload da mídia para o Firebase Storage
              Alert.alert('Sucesso', 'Mídia enviada com sucesso!');
              setSelectedMedia(null);
              navigation.goBack();
            }
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert('Aviso', 'Por favor, selecione uma mídia para fazer o upload.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload de Mídia</Text>
      <TouchableOpacity style={styles.selectButton} onPress={pickMedia}>
        <Text style={styles.selectButtonText}>Selecionar Vídeo ou Foto</Text>
      </TouchableOpacity>
      {selectedMedia && (
        <View style={styles.mediaPreview}>
          <Text style={styles.previewText}>Mídia selecionada: {selectedMedia.substring(selectedMedia.lastIndexOf('/') + 1)}</Text>
          {/* Aqui você pode adicionar uma pré-visualização da imagem/vídeo */}
        </View>
      )}
      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Text style={styles.buttonText}>Fazer Upload</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  selectButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mediaPreview: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 16,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UploadMediaScreen;
```

## Como Executar o Aplicativo

1.  **Navegue até o diretório do projeto:**
    ```bash
    cd AtletaApp
    ```
2.  **Inicie o servidor de desenvolvimento Expo:**
    ```bash
    npx expo start
    ```
3.  **Abra o aplicativo:**
    *   **No seu telefone:** Escaneie o código QR exibido no terminal com o aplicativo Expo Go (disponível na App Store e Google Play).
    *   **No emulador/simulador:** Pressione `a` para Android ou `i` para iOS no terminal.
    *   **No navegador:** Pressione `w` para abrir no navegador (funcionalidade limitada).

## Próximos Passos e Melhorias

*   **Integração Completa com Firebase:** Conectar todas as telas e funcionalidades ao Firestore e Storage para persistência de dados.
*   **Gerenciamento de Estado:** Implementar um gerenciamento de estado mais robusto (ex: Redux, Context API) para dados globais como o perfil do usuário.
*   **Validação de Formulários:** Adicionar validações mais completas nos formulários de registro e adição de atletas.
*   **UI/UX:** Refinar a interface do usuário com base nas imagens fornecidas, aplicando estilos e componentes mais elaborados.
*   **Notificações:** Implementar notificações push para eventos importantes (ex: nova mensagem de olheiro, atualização de métricas).
*   **Pesquisa e Filtros:** Adicionar funcionalidades de pesquisa e filtros para atletas e mídias.
*   **Segurança:** Revisar e fortalecer as regras de segurança do Firebase para produção.
*   **Testes:** Escrever testes unitários e de integração para garantir a estabilidade do aplicativo.

---

**Autor:** Manus AI
**Data:** 26 de Setembro de 2025

