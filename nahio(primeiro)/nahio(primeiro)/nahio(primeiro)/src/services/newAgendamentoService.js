import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
   } from 'firebase/firestore';
   import { db } from '../config/firebaseConfig';
   import { COLLECTIONS, AGENDAMENTO_STATUS } from './firebaseStructure';
   class AgendamentoService {
    // Criar novo agendamento
    async criarAgendamento(agendamentoData) {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.AGENDAMENTOS), {
          ...agendamentoData,
          status: AGENDAMENTO_STATUS.PENDENTE,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true, agendamentoId: docRef.id };
      } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar agendamentos por olheiro
    async buscarAgendamentosPorOlheiro(olheiroId) {
      try {
        const q = query(
          collection(db, COLLECTIONS.AGENDAMENTOS),
          where('olheiroId', '==', olheiroId),
          orderBy('dataVisita', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const agendamentos = [];
        for (const docSnap of querySnapshot.docs) {
          const agendamento = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados da instituição
          const instituicaoDoc = await getDoc(doc(db, COLLECTIONS.INSTITUICOES, 
  agendamento.instituicaoId));
          if (instituicaoDoc.exists()) {
            agendamento.instituicao = instituicaoDoc.data();
          }
          agendamentos.push(agendamento);
        }
        return { success: true, agendamentos };
      } catch (error) {
        console.error('Erro ao buscar agendamentos do olheiro:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar agendamentos por instituição
    async buscarAgendamentosPorInstituicao(instituicaoId) {
      try {
        const q = query(
          collection(db, COLLECTIONS.AGENDAMENTOS),
          where('instituicaoId', '==', instituicaoId),
          orderBy('dataVisita', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const agendamentos = [];
        for (const docSnap of querySnapshot.docs) {
          const agendamento = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados do olheiro
          const olheiroDoc = await getDoc(doc(db, COLLECTIONS.OLHEIROS, 
  agendamento.olheiroId));
          if (olheiroDoc.exists()) {
            agendamento.olheiro = olheiroDoc.data();
          }
          agendamentos.push(agendamento);
        }
        return { success: true, agendamentos };
      } catch (error) {
        console.error('Erro ao buscar agendamentos da instituição:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar agendamento por ID
    async buscarAgendamentoPorId(agendamentoId) {
      try {
        const docRef = doc(db, COLLECTIONS.AGENDAMENTOS, agendamentoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const agendamento = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados do olheiro
          const olheiroDoc = await getDoc(doc(db, COLLECTIONS.OLHEIROS, 
  agendamento.olheiroId));
          if (olheiroDoc.exists()) {
            agendamento.olheiro = olheiroDoc.data();
          }
          // Buscar dados da instituição
          const instituicaoDoc = await getDoc(doc(db, COLLECTIONS.INSTITUICOES, 
  agendamento.instituicaoId));
          if (instituicaoDoc.exists()) {
            agendamento.instituicao = instituicaoDoc.data();
          }
          return { success: true, agendamento };
        } else {
          return { success: false, error: 'Agendamento não encontrado' };
        }
      } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        return { success: false, error: error.message };
      }
    }
    // Atualizar status do agendamento
    async atualizarStatusAgendamento(agendamentoId, novoStatus, observacoes = '') 
  {
      try {
        const docRef = doc(db, COLLECTIONS.AGENDAMENTOS, agendamentoId);
        const updateData = {
          status: novoStatus,
          updatedAt: serverTimestamp()
        };
        if (observacoes) {
          updateData.observacoes = observacoes;
        }
        await updateDoc(docRef, updateData);
        return { success: true };
      } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        return { success: false, error: error.message };
      }
    }
    // Cancelar agendamento
    async cancelarAgendamento(agendamentoId, motivo = '') {
      try {
        const docRef = doc(db, COLLECTIONS.AGENDAMENTOS, agendamentoId);
        await updateDoc(docRef, {
          status: AGENDAMENTO_STATUS.CANCELADO,
          observacoes: motivo,
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        return { success: false, error: error.message };
      }
    }
    // Confirmar agendamento
    async confirmarAgendamento(agendamentoId) {
      try {
        const docRef = doc(db, COLLECTIONS.AGENDAMENTOS, agendamentoId);
        await updateDoc(docRef, {
          status: AGENDAMENTO_STATUS.CONFIRMADO,
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao confirmar agendamento:', error);
        return { success: false, error: error.message };
      }
    }
    // Marcar agendamento como realizado
    async marcarComoRealizado(agendamentoId) {
      try {
        const docRef = doc(db, COLLECTIONS.AGENDAMENTOS, agendamentoId);
        await updateDoc(docRef, {
          status: AGENDAMENTO_STATUS.REALIZADO,
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao marcar agendamento como realizado:', error);
        return { success: false, error: error.message };
      }
    }
    // Deletar agendamento
    async deletarAgendamento(agendamentoId) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.AGENDAMENTOS, agendamentoId));
        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar agendamentos próximos (próximos 7 dias)
    async buscarAgendamentosProximos(userId, userType) {
      try {
        const agora = new Date();
        const proximosSete = new Date();
        proximosSete.setDate(agora.getDate() + 7);
        let q;
        if (userType === 'olheiro') {
          q = query(
            collection(db, COLLECTIONS.AGENDAMENTOS),
            where('olheiroId', '==', userId),
            where('dataVisita', '>=', Timestamp.fromDate(agora)),
            where('dataVisita', '<=', Timestamp.fromDate(proximosSete)),
            where('status', 'in', [AGENDAMENTO_STATUS.PENDENTE, 
  AGENDAMENTO_STATUS.CONFIRMADO]),
            orderBy('dataVisita', 'asc')
          );
        } else {
          q = query(
            collection(db, COLLECTIONS.AGENDAMENTOS),
            where('instituicaoId', '==', userId),
            where('dataVisita', '>=', Timestamp.fromDate(agora)),
            where('dataVisita', '<=', Timestamp.fromDate(proximosSete)),
            where('status', 'in', [AGENDAMENTO_STATUS.PENDENTE, 
  AGENDAMENTO_STATUS.CONFIRMADO]),
            orderBy('dataVisita', 'asc')
          );
        }
        const querySnapshot = await getDocs(q);
        const agendamentos = [];
        for (const docSnap of querySnapshot.docs) {
          const agendamento = { id: docSnap.id, ...docSnap.data() };
          if (userType === 'olheiro') {
            // Buscar dados da instituição
            const instituicaoDoc = await getDoc(doc(db, COLLECTIONS.INSTITUICOES, 
  agendamento.instituicaoId));
            if (instituicaoDoc.exists()) {
              agendamento.instituicao = instituicaoDoc.data();
            }
          } else {
            // Buscar dados do olheiro
            const olheiroDoc = await getDoc(doc(db, COLLECTIONS.OLHEIROS, 
  agendamento.olheiroId));
            if (olheiroDoc.exists()) {
              agendamento.olheiro = olheiroDoc.data();
            }
          }
          agendamentos.push(agendamento);
        }
        return { success: true, agendamentos };
      } catch (error) {
        console.error('Erro ao buscar agendamentos próximos:', error);
        return { success: false, error: error.message };
      }
    }
    // Verificar disponibilidade de horário
    async verificarDisponibilidade(instituicaoId, dataVisita, horario, 
  agendamentoIdExcluir = null) {
      try {
        const dataInicio = new Date(dataVisita);
        dataInicio.setHours(0, 0, 0, 0);
        const dataFim = new Date(dataVisita);
        dataFim.setHours(23, 59, 59, 999);
        let q = query(
          collection(db, COLLECTIONS.AGENDAMENTOS),
          where('instituicaoId', '==', instituicaoId),
          where('dataVisita', '>=', Timestamp.fromDate(dataInicio)),
          where('dataVisita', '<=', Timestamp.fromDate(dataFim)),
          where('horario', '==', horario),
          where('status', 'in', [AGENDAMENTO_STATUS.PENDENTE, 
  AGENDAMENTO_STATUS.CONFIRMADO])
        );
        const querySnapshot = await getDocs(q);
        // Se está editando um agendamento, excluir ele da verificação
        const conflitos = querySnapshot.docs.filter(doc => 
          agendamentoIdExcluir ? doc.id !== agendamentoIdExcluir : true
        );
        return {
          success: true,
          disponivel: conflitos.length === 0,
          conflitos: conflitos.length
        };
      } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar estatísticas de agendamentos
    async buscarEstatisticasAgendamentos(userId, userType) {
      try {
        let q;
        if (userType === 'olheiro') {
          q = query(
            collection(db, COLLECTIONS.AGENDAMENTOS),
            where('olheiroId', '==', userId)
          );
        } else {
          q = query(
            collection(db, COLLECTIONS.AGENDAMENTOS),
            where('instituicaoId', '==', userId)
          );
        }
        const querySnapshot = await getDocs(q);
        const stats = {
          total: 0,
          pendentes: 0,
          confirmados: 0,
          realizados: 0,
          cancelados: 0
        };
        querySnapshot.forEach((doc) => {
          const agendamento = doc.data();
          stats.total++;
          switch (agendamento.status) {
            case AGENDAMENTO_STATUS.PENDENTE:
              stats.pendentes++;
              break;
            case AGENDAMENTO_STATUS.CONFIRMADO:
              stats.confirmados++;
              break;
            case AGENDAMENTO_STATUS.REALIZADO:
  stats.realizados++;
   break;
   case AGENDAMENTO_STATUS.CANCELADO:
   stats.cancelados++;
   break;
   }
   });
   return { success: true, stats };
   } catch (error) {
   console.error('Erro ao buscar estatísticas:', error);
   return { success: false, error: error.message };
   }
   }
   }
   export default new AgendamentoService();