import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { analisarLote, analisarRefino3M, formatarReal } from './src/auction';

const CAMPOS = [
  ['peso', 'Peso do metal analisado, sem pedras (g)', 'decimal-pad'],
  ['teor', 'Teor do ouro (milésimos)', 'number-pad'],
  ['cotacao', 'Ouro 24k por grama (R$)', 'decimal-pad'],
  ['lance', 'Lance atual (R$)', 'decimal-pad'],
  ['custos', 'Custos adicionais (R$)', 'decimal-pad']
];

const CAMPOS_REFINO = [
  ['peso', 'Peso da liga de ouro, sem pedras (g)', 'decimal-pad'],
  ['amostra', 'Peso retirado para análise (g)', 'decimal-pad'],
  ['teor', 'Teor estimado do ouro (milésimos)', 'number-pad'],
  ['kitco', 'Kitco ouro por grama (R$)', 'decimal-pad'],
  ['desconto', 'Desconto da refinadora por grama (R$)', 'decimal-pad'],
  ['pesoPrata', 'Prata fina estimada para taxa (g)', 'decimal-pad'],
  ['precoPrata', 'Preço da prata usado na taxa (R$/g)', 'decimal-pad'],
  ['precoVendaOuro', 'Preço de venda do ouro fino (R$/g)', 'decimal-pad'],
  ['lance', 'Preço total de compra do lote (R$)', 'decimal-pad'],
  ['custos', 'Outros custos, sem o refino (R$)', 'decimal-pad']
];

export default function App() {
  const [modo, setModo] = useState('refino');
  const [campos, setCampos] = useState({ peso: '10', teor: '750', cotacao: '650', lance: '3500', custos: '200' });
  const [camposRefino, setCamposRefino] = useState({ peso: '', amostra: '', teor: '', kitco: '', desconto: '', pesoPrata: '', precoPrata: '', precoVendaOuro: '', lance: '', custos: '0' });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  function atualizar(nome, valor) {
    const atualizarCampos = modo === 'refino' ? setCamposRefino : setCampos;
    atualizarCampos((atual) => ({ ...atual, [nome]: valor }));
    setErro('');
    setResultado(null);
  }

  function selecionarModo(novoModo) {
    setModo(novoModo);
    setErro('');
    setResultado(null);
  }

  function analisar() {
    try {
      setResultado(modo === 'refino' ? analisarRefino3M(camposRefino) : analisarLote(campos));
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
          <View style={styles.modos}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: modo === 'manual' }} style={[styles.modo, modo === 'manual' && styles.modoAtivo]} onPress={() => selecionarModo('manual')}>
              <Text style={styles.modoTexto}>Simulação auxiliar</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: modo === 'refino' }} style={[styles.modo, modo === 'refino' && styles.modoAtivo]} onPress={() => selecionarModo('refino')}>
              <Text style={styles.modoTexto}>Análise com refino</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.titulo}>Analisar lote</Text>
            <Text style={styles.orientacao}>{modo === 'refino'
              ? 'Simule a taxa da refinadora antes de comprar. Informe a liga de ouro sem pedras e a prata separadamente. Digite 0 para amostra ou prata somente se tiver confirmado que não existem.'
              : 'Simulação auxiliar sem custo de refinadora. Não use este resultado para decidir uma compra.'}</Text>
            {(modo === 'refino' ? CAMPOS_REFINO : CAMPOS).map(([nome, label, keyboardType]) => (
              <View key={nome}>
                <Text style={styles.label}>{label}</Text>
                <TextInput accessibilityLabel={label} style={styles.input} value={modo === 'refino' ? camposRefino[nome] : campos[nome]} onChangeText={(valor) => atualizar(nome, valor)} keyboardType={keyboardType} placeholder="0" placeholderTextColor="#626b79" />
              </View>
            ))}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={analisar}>
              <Text style={styles.botaoTexto}>ANALISAR OPORTUNIDADE</Text>
            </TouchableOpacity>
          </View>
          {resultado && (
            <View style={styles.resultado} accessibilityLiveRegion="polite">
              <Text style={[styles.decisao, { color: modo === 'refino' ? cor : '#f4c95d' }]}>{modo === 'refino' ? resultado.decisao : 'SIMULAÇÃO AUXILIAR'}</Text>
              <Text style={styles.info}>Ouro fino: {resultado.ouroFino.toFixed(2)} g</Text>
              {modo === 'refino' ? (
                <>
                  <Text style={styles.info}>Ouro cobrado no refino (3%): {resultado.gramasTaxaOuro.toFixed(2)} g</Text>
                  <Text style={styles.info}>Taxa do ouro: {formatarReal(resultado.custoRefinoOuro)}</Text>
                  <Text style={styles.info}>Taxa da prata: {formatarReal(resultado.custoRefinoPrata)}</Text>
                  <Text style={styles.info}>Custo total do refino: {formatarReal(resultado.custoRefino)}</Text>
                  <Text style={styles.info}>Venda estimada do ouro: {formatarReal(resultado.valorVendaOuro)}</Text>
                  <Text style={styles.info}>Custo total (compra + refino + outros): {formatarReal(resultado.custoTotal)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.info}>Recuperação estimada: {resultado.recuperavel.toFixed(2)} g</Text>
                  <Text style={styles.info}>Valor recuperável: {formatarReal(resultado.valor)}</Text>
                </>
              )}
              <Text style={styles.info}>Lance máximo: {formatarReal(resultado.lanceMax)}</Text>
              <Text style={styles.lucro}>Lucro estimado: {formatarReal(resultado.lucro)}</Text>
              <Text style={[styles.roi, { color: cor }]}>ROI: {resultado.roi === null ? 'não aplicável (custo zero)' : `${resultado.roi.toFixed(1)}%`}</Text>
            </View>
          )}
          <Text style={styles.aviso}>{modo === 'refino'
            ? 'Conforme simulação 3M: taxa de 3% do ouro fino a Kitco menos desconto; prata cobrada pelo peso informado. Ouro devolvido integralmente após a amostra. Margem mínima de 15%. Confirme teor, pesagens, preços e cobrança com a refinadora antes de comprar.'
            : 'Estimativa antiga com recuperação de 98%, sem custo da refinadora. A decisão de compra exige a análise com refino.'}</Text>
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
  modos: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  modo: { flex: 1, backgroundColor: '#151922', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#303746' },
  modoAtivo: { borderColor: '#f4c95d' },
  modoTexto: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  card: { backgroundColor: '#151922', borderRadius: 18, padding: 18 },
  titulo: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  orientacao: { color: '#f4c95d', fontSize: 13, lineHeight: 18, marginBottom: 4 },
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
