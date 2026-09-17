import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { analisarLote, analisarRefino3M, formatarReal, parseNumero } from './src/auction';
import { extrairDadosLote, extrairLotePublico } from './src/caixa';
import { LER_LOTE_VISIVEL, URL_VITRINE, urlPublica } from './src/vitrine';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analisarPreLance } from './src/prelance';
import { prepararRefinoAposMedicao } from './src/medicao';

const CAMPOS_PRE = [
  ['pesoTotal', 'Peso total anunciado (g)'],
  ['pesoMetalMinimo', 'Hipótese mínima de liga de ouro, sem pedras (g)'],
  ['teor', 'Teor declarado ou hipótese (milésimos)'],
  ['precoVendaOuro', 'Preço de venda do ouro fino (R$/g)'],
  ['lance', 'Lance que pretende oferecer (R$)'],
  ['custos', 'Outros custos (R$)'],
  ['tarifaPercentual', 'Tarifa sobre o lance (%)']
];

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
  ['taxaRefinoPercentual', 'Taxa de refino do ouro fino (%)', 'decimal-pad'],
  ['pesoPrata', 'Prata fina estimada para taxa (g)', 'decimal-pad'],
  ['precoPrata', 'Preço da prata usado na taxa (R$/g)', 'decimal-pad'],
  ['precoVendaOuro', 'Preço de venda do ouro fino (R$/g)', 'decimal-pad'],
  ['lance', 'Preço total de compra do lote (R$)', 'decimal-pad'],
  ['custos', 'Outros custos, sem o refino (R$)', 'decimal-pad']
];

export default function App() {
  const [modo, setModo] = useState('refino');
  const [campos, setCampos] = useState({ peso: '10', teor: '750', cotacao: '650', lance: '3500', custos: '200' });
  const [camposRefino, setCamposRefino] = useState({ peso: '', amostra: '', teor: '', kitco: '', desconto: '', taxaRefinoPercentual: '', pesoPrata: '', precoPrata: '', precoVendaOuro: '', lance: '', custos: '0' });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [textoLote, setTextoLote] = useState('');
  const [loteCaixa, setLoteCaixa] = useState(null);
  const [vitrineAberta, setVitrineAberta] = useState(false);
  const [vitrineUrl, setVitrineUrl] = useState(URL_VITRINE);
  const [lotePendente, setLotePendente] = useState(null);
  const [loteManual, setLoteManual] = useState({ numero: '', descricao: '', pesoTotal: '', lanceMinimo: '' });
  const [salvos, setSalvos] = useState([]);
  const navegador = useRef(null);
  const [camposPre, setCamposPre] = useState({ pesoTotal: '', pesoMetalMinimo: '', teor: '', precoVendaOuro: '', lance: '', custos: '0', tarifaPercentual: '6' });
  const [pesoMedido, setPesoMedido] = useState('');
  const [teorMedido, setTeorMedido] = useState('');

  async function abrirManuais() {
    try {
      const dados = JSON.parse(await AsyncStorage.getItem('lotes-manuais-v1') || '[]');
      setSalvos(Array.isArray(dados) ? dados : []);
    } catch { setSalvos([]); }
  }

  function selecionarLote(dados) {
    setLotePendente(dados);
    setVitrineAberta(false);
    setResultado(null);
    setErro('');
  }

  function confirmarLote() {
    if (!lotePendente) return;
    setCamposPre((anterior) => ({ ...anterior, pesoTotal: String(lotePendente.pesoTotal).replace('.', ','),
      pesoMetalMinimo: '', teor: '', lance: String(lotePendente.lanceMinimo).replace('.', ',') }));
    setNumeroLote(lotePendente.numero);
    setResultado(null);
    setErro('');
    setLotePendente(null);
  }

  function importarDaPagina(evento) {
    try {
      selecionarLote(extrairLotePublico(JSON.parse(evento.nativeEvent.data)));
    } catch (error) { setErro(error.message || 'Abra primeiro o detalhe de um lote na Vitrine.'); }
  }

  async function salvarManual() {
    try {
      if (!loteManual.descricao.trim() || !loteManual.pesoTotal.trim()) throw new Error('Informe a descrição e o peso total.');
      const pesoNaDescricao = loteManual.descricao.match(/PESO\s+LOTE\s*:\s*(\d+(?:[.,]\d+)?)\s*G\b/i)?.[1];
      if (pesoNaDescricao && Number(pesoNaDescricao.replace(',', '.')) !== Number(loteManual.pesoTotal.replace(',', '.'))) {
        throw new Error('O peso informado difere do peso escrito na descrição. Confira o lote.');
      }
      const descricao = loteManual.descricao.replace(/PESO\s+LOTE\s*:\s*\d+(?:[.,]\d+)?\s*G\b/ig, '').trim();
      const texto = `Descrição: ${descricao} PESO LOTE: ${loteManual.pesoTotal}G\nValor do lance mínimo: R$${loteManual.lanceMinimo}\nNúmero do lote: ${loteManual.numero}`;
      const dados = extrairDadosLote(texto, loteManual.numero);
      const atualizados = [dados, ...salvos.filter((lote) => lote.numero !== dados.numero)].slice(0, 50);
      await AsyncStorage.setItem('lotes-manuais-v1', JSON.stringify(atualizados));
      setSalvos(atualizados);
      selecionarLote({ ...dados, tipo: 'manual' });
    } catch (error) { setErro(error.message); }
  }

  function irParaRefino() {
    try {
      const medicao = prepararRefinoAposMedicao(camposPre, pesoMedido, teorMedido);
      setCamposRefino((anterior) => ({ ...anterior, ...medicao, amostra: '', kitco: '', desconto: '', taxaRefinoPercentual: '', pesoPrata: '', precoPrata: '' }));
      setResultado(null);
      setErro('');
      setModo('refino');
    } catch (error) {
      setErro(error.message);
    }
  }

  function importarLote() {
    try {
      const lote = extrairDadosLote(textoLote, numeroLote);
      setLoteCaixa(lote);
      setCamposRefino((anterior) => ({ ...anterior, peso: '', teor: '', lance: String(lote.lanceMinimo) }));
      setResultado(null);
      setErro('');
    } catch (error) {
      setLoteCaixa(null);
      setResultado(null);
      setErro(error.message);
    }
  }

  function importarTextoPreLance() {
    try {
      selecionarLote({ ...extrairDadosLote(textoLote, numeroLote), tipo: 'texto' });
    } catch (error) { setErro(error.message); }
  }

  function atualizar(nome, valor) {
    const atualizarCampos = modo === 'pre' ? setCamposPre : modo === 'refino' ? setCamposRefino : setCampos;
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
      if (modo === 'pre') {
        setResultado(analisarPreLance(camposPre));
        setErro('');
        return;
      }
      if (modo === 'refino' && loteCaixa && parseNumero(camposRefino.peso) > loteCaixa.pesoTotal) {
        throw new Error('O peso da liga sem pedras não pode superar o peso total anunciado pela Caixa.');
      }
      if (modo === 'refino' && loteCaixa && parseNumero(camposRefino.lance) < loteCaixa.lanceMinimo) {
        throw new Error('O preço de compra não pode ser inferior ao lance mínimo publicado.');
      }
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
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: modo === 'pre' }} style={[styles.modo, modo === 'pre' && styles.modoAtivo]} onPress={() => selecionarModo('pre')}>
              <Text style={styles.modoTexto}>Pré-lance</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: modo === 'manual' }} style={[styles.modo, modo === 'manual' && styles.modoAtivo]} onPress={() => selecionarModo('manual')}>
              <Text style={styles.modoTexto}>Simulação auxiliar</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: modo === 'refino' }} style={[styles.modo, modo === 'refino' && styles.modoAtivo]} onPress={() => selecionarModo('refino')}>
              <Text style={styles.modoTexto}>Análise com refino</Text>
            </TouchableOpacity>
          </View>
          {modo === 'pre' && <View style={styles.card}>
            <Text style={styles.titulo}>Lotes públicos da Caixa</Text>
            <Text style={styles.orientacao}>Consulte lotes em exposição no site oficial, sem cadastro. Escolha um leilão e toque no lote para ver foto, peso total e lance mínimo.</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={() => { setVitrineUrl(URL_VITRINE); setVitrineAberta(true); setErro(''); }}><Text style={styles.botaoTexto}>ESCOLHER LOTE PÚBLICO</Text></TouchableOpacity>
            {vitrineAberta && <View>
              <Text style={styles.info}>Na Vitrine: escolha mês, leilão e abra o detalhe do lote. Depois toque no botão abaixo.</Text>
              <View style={styles.navegador}>
                <WebView ref={navegador} source={{ uri: vitrineUrl }} javaScriptEnabled
                  originWhitelist={['https://vitrinedejoias.caixa.gov.br']}
                  onShouldStartLoadWithRequest={({ url }) => urlPublica(url)}
                  onOpenWindow={(evento) => { const url = evento.nativeEvent.targetUrl; if (urlPublica(url)) setVitrineUrl(url); }}
                  onMessage={importarDaPagina}
                  onError={() => setErro('A Vitrine não carregou. Tente novamente mais tarde ou cadastre o lote manualmente.')} />
              </View>
              <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={() => navegador.current?.injectJavaScript(LER_LOTE_VISIVEL)}><Text style={styles.botaoTexto}>IMPORTAR LOTE ABERTO</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={() => setVitrineAberta(false)}><Text style={styles.label}>Fechar Vitrine</Text></TouchableOpacity>
            </View>}
          </View>}
          {modo === 'pre' && <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.titulo}>Importar texto do anúncio</Text>
            <Text style={styles.orientacao}>Se a Vitrine não carregar no app, copie o texto publicado e confira os dados antes do pré-lance.</Text>
            <Text style={styles.label}>Número completo do lote</Text>
            <TextInput accessibilityLabel="Número do lote para pré-lance" style={styles.input} value={numeroLote} onChangeText={setNumeroLote} placeholder="0041.000001-9" placeholderTextColor="#626b79" />
            <Text style={styles.label}>Descrição, peso total, lance mínimo e número</Text>
            <TextInput accessibilityLabel="Texto do lote para pré-lance" style={[styles.input, { minHeight: 100 }]} multiline value={textoLote} onChangeText={setTextoLote} />
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={importarTextoPreLance}><Text style={styles.botaoTexto}>CONFERIR TEXTO DO LOTE</Text></TouchableOpacity>
          </View>}
          {modo === 'pre' && <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.titulo}>Meu lote · cadastro manual</Text>
            <Text style={styles.orientacao}>Salvo somente neste aparelho. Inclua a descrição publicada ou recebida; não inclua dados pessoais de terceiros.</Text>
            {([['numero', 'Número do lote'], ['descricao', 'Descrição, incluindo PESO LOTE: 10,00G'], ['pesoTotal', 'Peso total anunciado (g)'], ['lanceMinimo', 'Lance mínimo (R$)']]).map(([chave, rotulo]) => <View key={chave}>
              <Text style={styles.label}>{rotulo}</Text>
              <TextInput accessibilityLabel={rotulo} style={styles.input} multiline={chave === 'descricao'} value={loteManual[chave]}
                onChangeText={(valor) => setLoteManual((anterior) => ({ ...anterior, [chave]: valor }))}
                keyboardType={chave === 'pesoTotal' || chave === 'lanceMinimo' ? 'decimal-pad' : 'default'} />
            </View>)}
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={salvarManual}><Text style={styles.botaoTexto}>SALVAR E ANALISAR LOTE</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={abrirManuais}><Text style={styles.label}>Ver lotes salvos neste aparelho</Text></TouchableOpacity>
            {salvos.map((lote) => <TouchableOpacity key={lote.numero} accessibilityRole="button" onPress={() => selecionarLote({ ...lote, tipo: 'manual' })}><Text style={styles.info}>{lote.numero} · {lote.pesoTotal.toFixed(2)} g · {formatarReal(lote.lanceMinimo)}</Text></TouchableOpacity>)}
          </View>}
          {modo === 'pre' && lotePendente && <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.titulo}>Conferir antes de importar</Text>
            <Text style={styles.info}>Lote: {lotePendente.numero} · {lotePendente.tipo === 'manual' ? 'inserido por você' : lotePendente.tipo === 'texto' ? 'texto colado por você' : 'Vitrine pública da Caixa'}</Text>
            <Text style={styles.info}>Peso TOTAL: {lotePendente.pesoTotal.toFixed(2)} g · mínimo: {formatarReal(lotePendente.lanceMinimo)}</Text>
            {lotePendente.fotos?.map((foto) => <Image key={foto} source={{ uri: foto }} style={{ height: 180, marginBottom: 8, borderRadius: 8 }} resizeMode="contain" />)}
            <Text style={styles.info}>{lotePendente.descricao}</Text>
            {lotePendente.origem && <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(lotePendente.origem)}><Text style={styles.label}>Conferir na fonte oficial</Text></TouchableOpacity>}
            <Text style={styles.orientacao}>O peso total pode incluir pedras, prata e outros materiais. Confirme os dados; o peso de ouro e o teor permanecem vazios.</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={confirmarLote}><Text style={styles.botaoTexto}>CONFIRMAR E PREENCHER PRÉ-LANCE</Text></TouchableOpacity>
          </View>}
          {modo === 'pre' && <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.titulo}>Depois de receber o lote</Text>
            <Text style={styles.orientacao}>Separe e pese a liga de ouro sem pedras. Informe o teor testado ou confirmado. A hipótese usada antes do lance não será copiada como medição.</Text>
            <Text style={styles.label}>Peso medido da liga de ouro sem pedras (g)</Text>
            <TextInput accessibilityLabel="Peso medido da liga de ouro sem pedras" style={styles.input} keyboardType="decimal-pad" value={pesoMedido} onChangeText={setPesoMedido} placeholder="Ex.: 6,70" placeholderTextColor="#626b79" />
            <Text style={styles.label}>Teor medido ou confirmado (milésimos)</Text>
            <TextInput accessibilityLabel="Teor medido ou confirmado" style={styles.input} keyboardType="number-pad" value={teorMedido} onChangeText={setTeorMedido} placeholder="Ex.: 750" placeholderTextColor="#626b79" />
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={irParaRefino}><Text style={styles.botaoTexto}>LEVAR MEDIÇÃO À ANÁLISE COM REFINO</Text></TouchableOpacity>
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>}
          {modo === 'refino' && <View style={styles.card}>
            <Text style={styles.titulo}>Consultar lote da Caixa</Text>
            <Text style={styles.orientacao}>Digite o número completo. Abra a Vitrine oficial, copie os detalhes do lote e cole aqui. A consulta direta pelo número ainda está em desenvolvimento.</Text>
            <TextInput accessibilityLabel="Número do lote da Caixa" style={styles.input} value={numeroLote} onChangeText={(v) => { setNumeroLote(v); setLoteCaixa(null); setResultado(null); }} placeholder="0041.000257-7" placeholderTextColor="#626b79" />
            <TouchableOpacity accessibilityRole="link" style={styles.botao} onPress={() => Linking.openURL('https://vitrinedejoias.caixa.gov.br/Paginas/default.aspx').catch(() => setErro('Não foi possível abrir a Vitrine da Caixa.'))}>
              <Text style={styles.botaoTexto}>ABRIR VITRINE DA CAIXA</Text>
            </TouchableOpacity>
            <TextInput accessibilityLabel="Detalhes copiados da Caixa" style={[styles.input, { marginTop: 14, minHeight: 100 }]} multiline value={textoLote} onChangeText={(v) => { setTextoLote(v); setLoteCaixa(null); setResultado(null); }} placeholder="Cole a descrição, o peso total, o lance mínimo e o número do lote" placeholderTextColor="#626b79" />
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={importarLote}><Text style={styles.botaoTexto}>IMPORTAR DADOS PUBLICADOS</Text></TouchableOpacity>
            {loteCaixa && <View>
              <Text style={styles.info}>Lote: {loteCaixa.numero}</Text>
              <Text style={styles.info}>Peso total no texto colado: {loteCaixa.pesoTotal.toFixed(2)} g (pode incluir pedras)</Text>
              <Text style={styles.info}>Lance mínimo no texto colado: {formatarReal(loteCaixa.lanceMinimo)}</Text>
              <Text style={styles.info}>{loteCaixa.descricao}</Text>
              <Text style={styles.orientacao}>Informe abaixo o peso estimado da liga SEM pedras e o teor. Sem esses dados, não há recomendação de compra.</Text>
            </View>}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          </View>}
          <View style={styles.card}>
            <Text style={styles.titulo}>Analisar lote</Text>
            <Text style={styles.orientacao}>{modo === 'pre'
              ? 'Simule somente a compra: hipótese de liga sem pedras, teor, preço de venda, lance, tarifa e outros custos. O refino é uma negociação separada, após receber o lote.'
              : modo === 'refino'
              ? 'Simule a taxa da refinadora antes de comprar. Informe a liga de ouro sem pedras e a prata separadamente. Digite 0 para amostra ou prata somente se tiver confirmado que não existem.'
              : 'Simulação auxiliar sem custo de refinadora. Não use este resultado para decidir uma compra.'}</Text>
            {(modo === 'pre' ? CAMPOS_PRE : modo === 'refino' ? CAMPOS_REFINO : CAMPOS).map(([nome, label, keyboardType]) => (
              <View key={nome}>
                <Text style={styles.label}>{label}</Text>
                <TextInput accessibilityLabel={label} style={styles.input} value={modo === 'pre' ? camposPre[nome] : modo === 'refino' ? camposRefino[nome] : campos[nome]} onChangeText={(valor) => atualizar(nome, valor)} keyboardType={keyboardType || 'decimal-pad'} placeholder="0" placeholderTextColor="#626b79" />
              </View>
            ))}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}
            <TouchableOpacity accessibilityRole="button" style={styles.botao} onPress={analisar}>
              <Text style={styles.botaoTexto}>ANALISAR OPORTUNIDADE</Text>
            </TouchableOpacity>
          </View>
          {resultado && (
            <View style={styles.resultado} accessibilityLiveRegion="polite">
              {modo === 'pre' ? <>
                <Text style={[styles.decisao, { color: '#f4c95d' }]}>CENÁRIO CONDICIONAL</Text>
                <Text style={styles.info}>Ouro fino na hipótese mínima: {resultado.ouroFino.toFixed(2)} g</Text>
                <Text style={styles.info}>Valor estimado do ouro: {formatarReal(resultado.receita)}</Text>
                <Text style={styles.info}>Tarifa estimada: {formatarReal(resultado.tarifa)}</Text>
                <Text style={styles.info}>Lance máximo para ROI de 15%: {formatarReal(resultado.lanceMaximo)}</Text>
                <Text style={styles.info}>Resultado da negociação, sem refino: {formatarReal(resultado.lucro)}</Text>
                <Text style={styles.orientacao}>{resultado.viavelNaHipotese ? 'O lance cabe apenas SE a hipótese mínima de metal e teor for verdadeira. Não é recomendação de compra.' : 'O lance ultrapassa o teto deste cenário.'}</Text>
              </> : <>
              <Text style={[styles.decisao, { color: modo === 'refino' ? cor : '#f4c95d' }]}>{modo === 'refino' ? resultado.decisao : 'SIMULAÇÃO AUXILIAR'}</Text>
              <Text style={styles.info}>Ouro fino: {resultado.ouroFino.toFixed(2)} g</Text>
              {modo === 'refino' ? (
                <>
                  <Text style={styles.info}>Ouro cobrado no refino ({resultado.taxaRefinoPercentual}%): {resultado.gramasTaxaOuro.toFixed(2)} g</Text>
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
              </>}
            </View>
          )}
          <Text style={styles.aviso}>{modo === 'pre' ? 'Simulação da compra sem refino. Os casos de 2018 documentam peso total e preço de leilão; não documentam resultado do refino. A hipótese mínima de metal exige evidência independente.' : modo === 'refino'
            ? 'Taxa percentual informada pelo usuário sobre o ouro fino, avaliada a Kitco menos desconto; prata cobrada pelo peso informado. Ouro devolvido integralmente após a amostra. Margem mínima de 15%. Confirme teor, pesagens, preços e cobrança com a refinadora.'
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
  navegador: { height: 440, marginTop: 14, borderRadius: 12, overflow: 'hidden' },
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
