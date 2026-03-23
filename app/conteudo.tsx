import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';

export default function ConteudoScreen() {
    const { url } = useLocalSearchParams<{ url: string }>();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={styles.backButton}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    accessibilityHint="Toca duas vezes para voltar à tela anterior"
                >
                    <Icon name="arrow-back" size={28} color="#004894" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} accessible={true} accessibilityRole="header">Conteúdo</Text>
                <View style={{ width: 40 }} />
            </View>
            {Platform.OS === 'web' ? (
                <iframe
                    src={url}
                    style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
                    title="Conteúdo"
                    allowFullScreen
                />
            ) : (
                <WebView
                    source={{ uri: url }}
                    style={styles.webview}
                    startInLoadingState
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#004894',
    },
    webview: {
        flex: 1,
    },
});
