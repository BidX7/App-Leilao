import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { analisarLote, formatarReal } from './src/auction';

const CAMPOS = [
  ['peso', 'Peso total (g)', 'decimal-pad'],
  ['teor', 'Teor do ouro (milésimos)', 'number-pad'],
  ['cotacao', 'Ouro 24k por grama (R$)', 'decimal-pad'],
  ['lance', 'Lance atual (R$)', 'decimal-pad'],
  ['custos', 'Custos adicionais (R$)', 'decimal-pad']
];

export default function App() {
  const [campos, setCampos] = useState({ peso: '10', teor: '750', cotacao: '650', lance: '3500', custos: '200' });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  function atualizar(nome, valor) {
    setCampos((atual) => ({ ...atual, [nome]: valor }));
    setErro('');
    setResultado(null);
  }

  function analisar() {
    try {
      setResultado(analisarLote(campos));
      setErro('');
    } catch (error) {
      setResultado(null);
      setErro(error.message);
    }
  }

  const cor = resultado?.decisao === 'COMPRAR' ? '#55e68a' : resultado?.decisao === 'CUIDADO' ? '#f4c95d' : '#ff6b6b';

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>APP LEILÃO</Text>
          <Text style={styles.subtitulo}>Inteligência para compra de metais</Text>
          <View style={styles.card}>
            <Text style={styles.titulo}>Analisar lote</Text>
            {CAMPOS.map(([nome, label, keyboardType]) => (
              <View key={nome}>
                <Text style={styles.label}>{label}</Text>
                <TextInput accessibilityLabel={label} style={styles.input} value={campos[nome]} onChangeText={(valor) => atualizar(nome, valor)} keyboardType={keyboardType} placeholder="0" placeholderTextColor="#626b79" />
              </View>
            ))}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={analisar}>
              <Text style={styles.botaoTexto}>ANALISAR OPORTUNIDADE</Text>
            </TouchableOpacity>
          </View>
          {resultado && (
            <View style={styles.resultado} accessibilityLiveRegion="polite">
              <Text style={[styles.decisao, { color: cor }]}>{resultado.decisao}</Text>
              <Text style={styles.info}>Ouro fino: {resultado.ouroFino.toFixed(2)} g</Text>
              <Text style={styles.info}>Recuperação estimada: {resultado.recuperavel.toFixed(2)} g</Text>
              <Text style={styles.info}>Valor recuperável: {formatarReal(resultado.valor)}</Text>
              <Text style={styles.info}>Lance máximo: {formatarReal(resultado.lanceMax)}</Text>
              <Text style={styles.lucro}>Lucro estimado: {formatarReal(resultado.lucro)}</Text>
              <Text style={[styles.roi, { color: cor }]}>ROI: {resultado.roi.toFixed(1)}%</Text>
            </View>
          )}
          <Text style={styles.aviso}>Estimativa com recuperação de 98% e margem mínima de 15%.</Text>
          <Text style={styles.rodape}>App Leilão • MVP v0.1</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#090b0f' },
  container: { padding: 20, paddingBottom: 50 },
  logo: { color: '#f4c95d', fontSize: 28, fontWeight: '900', marginTop: 15 },
  subtitulo: { color: '#8f98a8', marginBottom: 24 },
  card: { backgroundColor: '#151922', borderRadius: 18, padding: 18 },
  titulo: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  label: { color: '#b9c0cc', marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#090b0f', color: '#fff', padding: 14, borderRadius: 10, fontSize: 17, borderWidth: 1, borderColor: '#303746' },
  erro: { color: '#ff8a8a', marginTop: 14, lineHeight: 20 },
  botao: { backgroundColor: '#f4c95d', padding: 17, borderRadius: 12, marginTop: 22 },
  botaoTexto: { color: '#090b0f', textAlign: 'center', fontWeight: '900' },
  resultado: { backgroundColor: '#151922', marginTop: 18, padding: 20, borderRadius: 18 },
  decisao: { fontSize: 27, fontWeight: '900', marginBottom: 16 },
  info: { color: '#d9dde5', fontSize: 16, marginBottom: 9 },
  lucro: { color: '#f4c95d', fontSize: 19, fontWeight: '800', marginTop: 8 },
  roi: { fontSize: 19, fontWeight: '800', marginTop: 8 },
  aviso: { color: '#8f98a8', fontSize: 12, textAlign: 'center', marginTop: 18 },
  rodape: { color: '#626b79', textAlign: 'center', marginTop: 10 }
});
