import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNotaVentaDetalle, createPedido, updatePedido, deletePedido, updateNotaVentaTotales, updateNotaVenta, deleteNotaVenta, createPago } from '../services/api/pedidos';
import PedidoForm from '../components/pedidos/PedidoForm';
import EditNotaVentaForm from '../components/pedidos/EditNotaVentaForm';
import PagoForm from '../components/pagos/PagoForm';
import NotaVentaPDFTemplate from '../components/pedidos/NotaVentaPDFTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DetalleNotaVenta = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notaVenta, setNotaVenta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [processingPedido, setProcessingPedido] = useState(null);
  const [showEditNotaForm, setShowEditNotaForm] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [pdfTotals, setPdfTotals] = useState({
    subtotal: 0,
    iva: 0,
    total: 0
  });
  const pdfRef = useRef();

  // Función profesional para generar PDF
  const handlePrint = async () => {
    if (!notaVenta) {
      alert('No hay datos para generar el PDF');
      return;
    }

    if (selectedProducts.size === 0) {
      alert('Debe seleccionar al menos un producto para generar el PDF');
      return;
    }

    if (!pdfRef.current) {
      alert('Error: Componente PDF no está listo');
      return;
    }

    try {
      // Mostrar indicador de carga
      const loadingToast = document.createElement('div');
      loadingToast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #4F46E5; color: white; padding: 15px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 20px; height: 20px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>Generando PDF profesional...</span>
          </div>
        </div>
        <style>
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      `;
      document.body.appendChild(loadingToast);

      // Capturar el elemento como imagen con alta calidad
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // Alta resolución
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // Ancho A4 en píxeles
        height: 1123, // Alto A4 en píxeles
        scrollX: 0,
        scrollY: 0
      });

      // Crear el PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calcular dimensiones para que quepa perfectamente en A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Agregar la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si el contenido es más alto que una página, agregar páginas adicionales
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Remover indicador de carga de forma segura
      try {
        if (loadingToast.parentNode && document.body.contains(loadingToast)) {
          loadingToast.parentNode.removeChild(loadingToast);
        }
      } catch (e) {
        console.log('Loading toast ya removido');
      }

      // Guardar el PDF con un nombre descriptivo
      const fileName = `NotaVenta_${notaVenta.numero_factura || notaVenta.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Mostrar mensaje de éxito
      const successToast = document.createElement('div');
      successToast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10B981; color: white; padding: 15px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>PDF generado exitosamente</span>
          </div>
        </div>
      `;
      document.body.appendChild(successToast);

      // Remover mensaje de éxito después de 3 segundos
      setTimeout(() => {
        try {
          if (successToast.parentNode && document.body.contains(successToast)) {
            successToast.parentNode.removeChild(successToast);
          }
        } catch (e) {
          console.log('Success toast ya removido');
        }
      }, 3000);

    } catch (error) {
      console.error('Error al generar PDF:', error);

      // Remover cualquier toast que pueda estar presente de forma segura
      try {
        const existingToasts = document.querySelectorAll('[style*="position: fixed"][style*="top: 20px"]');
        existingToasts.forEach(toast => {
          try {
            if (toast.parentNode && document.body.contains(toast)) {
              toast.parentNode.removeChild(toast);
            }
          } catch (e) {
            console.log('Toast ya removido');
          }
        });
      } catch (e) {
        console.log('Error limpiando toasts existentes');
      }

      // Mostrar error
      const errorToast = document.createElement('div');
      errorToast.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #EF4444; color: white; padding: 15px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span>Error al generar PDF: ${error.message}</span>
          </div>
        </div>
      `;
      document.body.appendChild(errorToast);

      setTimeout(() => {
        try {
          if (errorToast.parentNode && document.body.contains(errorToast)) {
            errorToast.parentNode.removeChild(errorToast);
          }
        } catch (e) {
          console.log('Toast de error ya removido');
        }
      }, 5000);
    }
  };

  // Función para generar el HTML de impresión
  const generatePrintHTML = (nota) => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(amount || 0);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const productosHTML = nota.pedidos?.map(pedido => `
      <tr>
        <td style="border: 1px solid #333; padding: 8px;">${pedido.productos?.nombre || 'Producto sin nombre'}</td>
        <td style="border: 1px solid #333; padding: 8px; text-align: center;">${pedido.cantidad?.toLocaleString('es-MX') || '0'}</td>
        <td style="border: 1px solid #333; padding: 8px; text-align: right;">${formatCurrency(pedido.importe)}</td>
      </tr>
    `).join('') || `
      <tr>
        <td colspan="3" style="border: 1px solid #333; padding: 8px; text-align: center;">No hay productos registrados</td>
      </tr>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nota de Venta #${nota.numero_factura || nota.id}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
          }
          h1 { font-size: 24px; margin: 0 0 10px 0; }
          h2 { font-size: 18px; margin: 0 0 10px 0; }
          h3 { font-size: 16px; margin: 0 0 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .section { margin-bottom: 25px; }
          .totals { text-align: right; margin-top: 20px; }
          .totals-box { display: inline-block; background: #f5f5f5; padding: 15px; min-width: 250px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AIKZ INDUSTRIAL</h1>
          <p>Sistema de Gestión Industrial</p>
        </div>

        <div class="section">
          <h2>NOTA DE VENTA</h2>
          <p><strong>Número:</strong> ${nota.numero_factura || 'Sin número'}</p>
          <p><strong>Fecha:</strong> ${formatDate(nota.fecha)}</p>
          <p><strong>Folio:</strong> #${nota.id}</p>
        </div>

        <div class="section">
          <h3>DATOS DEL CLIENTE</h3>
          <p><strong>Empresa:</strong> ${nota.clientes?.empresa || 'Sin empresa'}</p>
          <p><strong>Contacto:</strong> ${nota.clientes?.nombre_contacto || 'Sin contacto'}</p>
          <p><strong>Teléfono:</strong> ${nota.clientes?.telefono || 'Sin teléfono'}</p>
          <p><strong>Crédito:</strong> ${nota.clientes?.dias_credito || 0} días</p>
        </div>

        <div class="section">
          <h3>PRODUCTOS</h3>
          <table>
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="border: 1px solid #333; padding: 8px; text-align: left;">Producto</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center;">Cantidad</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${productosHTML}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-box">
            <p><strong>Subtotal:</strong> ${formatCurrency(nota.subtotal)}</p>
            ${nota.descuento > 0 ? `<p style="color: red;">Descuento (${nota.descuento}%): -${formatCurrency((nota.subtotal * nota.descuento) / 100)}</p>` : ''}
            <p><strong>IVA (16%):</strong> ${nota.iva > 0 ? formatCurrency(nota.iva) : 'Sin IVA'}</p>
            <hr>
            <p style="font-size: 16px;"><strong>Total: ${formatCurrency(nota.total)}</strong></p>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #333;">
          <h4>CONDICIONES DE PAGO</h4>
          <p>Crédito a ${nota.clientes?.dias_credito || 0} días</p>
          <p>${nota.iva > 0 ? 'Venta con IVA - Requiere factura fiscal' : 'Venta sin IVA - Sin factura fiscal'}</p>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #666;">
          <p>Este documento es una nota de venta generada por AIKZ Industrial</p>
          <p>Impreso el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}</p>
        </div>
      </body>
      </html>
    `;
  };

  useEffect(() => {
    if (id) {
      loadNotaVentaDetalle();
    }
  }, [id]);

  // Inicializar todos los productos como seleccionados cuando se cargan los datos
  useEffect(() => {
    if (notaVenta && notaVenta.pedidos && notaVenta.pedidos.length > 0) {
      const allProductIds = new Set(notaVenta.pedidos.map(pedido => pedido.id));
      setSelectedProducts(allProductIds);
    }
  }, [notaVenta]);

  // Recalcular totales cuando cambian los productos seleccionados
  useEffect(() => {
    if (notaVenta && notaVenta.pedidos) {
      calculatePdfTotals();
    }
  }, [selectedProducts, notaVenta]);

  // Función para calcular totales de productos seleccionados
  const calculatePdfTotals = () => {
    if (!notaVenta || !notaVenta.pedidos) return;

    const selectedPedidos = notaVenta.pedidos.filter(pedido => selectedProducts.has(pedido.id));
    const subtotal = selectedPedidos.reduce((sum, pedido) => {
      const cantidad = pedido.cantidad || 0;
      const precioUnitario = pedido.precio_unitario_venta || pedido.precio_kilo_venta || 0;
      const importeCalculado = cantidad * precioUnitario;
      return sum + importeCalculado;
    }, 0);

    // Aplicar descuento proporcional
    const descuentoAplicado = (subtotal * (notaVenta.descuento || 0)) / 100;
    const subtotalConDescuento = subtotal - descuentoAplicado;

    // Calcular IVA solo si la nota original tiene IVA
    const iva = notaVenta.iva > 0 ? subtotalConDescuento * 0.16 : 0;
    const total = subtotalConDescuento + iva;

    setPdfTotals({
      subtotal: parseFloat(subtotal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  // Función para alternar selección de producto
  const toggleProductSelection = (pedidoId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pedidoId)) {
        newSet.delete(pedidoId);
      } else {
        newSet.add(pedidoId);
      }
      return newSet;
    });
  };

  // Función para seleccionar/deseleccionar todos los productos
  const toggleAllProducts = () => {
    if (!notaVenta || !notaVenta.pedidos) return;

    const allProductIds = notaVenta.pedidos.map(pedido => pedido.id);
    const allSelected = allProductIds.every(id => selectedProducts.has(id));

    if (allSelected) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(allProductIds));
    }
  };

  const loadNotaVentaDetalle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotaVentaDetalle(parseInt(id));
      setNotaVenta(data);
    } catch (err) {
      console.error('Error al cargar detalle de nota de venta:', err);
      setError(err.message || 'Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressBarColor = (percentage, type) => {
    if (type === 'payment') {
      if (percentage >= 100) return 'bg-green-500';
      if (percentage >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    if (type === 'delivery') {
      if (percentage >= 100) return 'bg-blue-500';
      if (percentage >= 50) return 'bg-orange-500';
      return 'bg-gray-500';
    }
    if (type === 'credit') {
      if (percentage >= 50) return 'bg-green-500';
      if (percentage >= 25) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return 'bg-gray-500';
  };

  // Funciones CRUD para pedidos
  const calcularTotales = (pedidos) => {
    const subtotal = pedidos.reduce((sum, pedido) => {
      return sum + ((pedido.cantidad || 0) * (pedido.precio_unitario_venta || 0));
    }, 0);
    const iva = subtotal * 0.16; // 16% IVA
    const total = subtotal + iva;

    return { subtotal, iva, total };
  };

  const handleSavePedido = async (pedidoData, pedidoId = null) => {
    try {
      setProcessingPedido(pedidoId || 'new');

      let updatedPedido;
      if (pedidoId) {
        // Actualizar pedido existente
        updatedPedido = await updatePedido(pedidoId, pedidoData);

        // Actualizar en el estado local
        setNotaVenta(prev => ({
          ...prev,
          pedidos: prev.pedidos.map(p =>
            p.id === pedidoId ? { ...updatedPedido, entregas: p.entregas } : p
          )
        }));
      } else {
        // Crear nuevo pedido
        updatedPedido = await createPedido(pedidoData);

        // Agregar al estado local
        setNotaVenta(prev => ({
          ...prev,
          pedidos: [...(prev.pedidos || []), { ...updatedPedido, entregas: [] }]
        }));
      }

      // Recalcular totales
      const nuevosPedidos = pedidoId
        ? notaVenta.pedidos.map(p => p.id === pedidoId ? updatedPedido : p)
        : [...(notaVenta.pedidos || []), updatedPedido];

      const nuevosToales = calcularTotales(nuevosPedidos);
      await updateNotaVentaTotales(parseInt(id), nuevosToales);

      // Actualizar totales en el estado
      setNotaVenta(prev => ({
        ...prev,
        subtotal: nuevosToales.subtotal,
        iva: nuevosToales.iva,
        total: nuevosToales.total
      }));

      // Recargar estadísticas
      await loadNotaVentaDetalle();

    } catch (error) {
      console.error('Error al guardar pedido:', error);
      alert('Error al guardar el pedido: ' + error.message);
    } finally {
      setProcessingPedido(null);
    }
  };

  const handleEditPedido = (pedido) => {
    setEditingPedido(pedido);
    setShowPedidoForm(true);
  };

  const handleDeletePedido = async (pedidoId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto de la nota de venta?')) {
      return;
    }

    try {
      setProcessingPedido(pedidoId);
      await deletePedido(pedidoId);

      // Remover del estado local
      const nuevosPedidos = notaVenta.pedidos.filter(p => p.id !== pedidoId);
      setNotaVenta(prev => ({
        ...prev,
        pedidos: nuevosPedidos
      }));

      // Recalcular totales
      const nuevosToales = calcularTotales(nuevosPedidos);
      await updateNotaVentaTotales(parseInt(id), nuevosToales);

      // Actualizar totales en el estado
      setNotaVenta(prev => ({
        ...prev,
        subtotal: nuevosToales.subtotal,
        iva: nuevosToales.iva,
        total: nuevosToales.total
      }));

      // Recargar estadísticas
      await loadNotaVentaDetalle();

    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      alert('Error al eliminar el pedido: ' + error.message);
    } finally {
      setProcessingPedido(null);
    }
  };

  const handleCloseForm = () => {
    setShowPedidoForm(false);
    setEditingPedido(null);
  };

  const handleEditNotaVenta = async (notaVentaData) => {
    try {
      const updatedNota = await updateNotaVenta(parseInt(id), notaVentaData);

      // Actualizar el estado local con los nuevos datos
      setNotaVenta(prev => ({
        ...prev,
        ...updatedNota
      }));

      // Recargar los detalles completos para refrescar las estadísticas
      await loadNotaVentaDetalle();

      setShowEditNotaForm(false);
    } catch (error) {
      console.error('Error al actualizar nota de venta:', error);
      throw error;
    }
  };

  const handleDeleteNotaVenta = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la Nota de Venta #${notaVenta.numero_factura}?\n\nEsta acción eliminará permanentemente:\n- La nota de venta\n- Todos los productos asociados\n- Todo el historial de pagos\n- Todo el historial de entregas\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    try {
      await deleteNotaVenta(parseInt(id));
      alert('Nota de venta eliminada exitosamente');
      navigate('/pedidos');
    } catch (error) {
      console.error('Error al eliminar nota de venta:', error);
      alert('Error al eliminar la nota de venta: ' + error.message);
    }
  };

  const handleSavePago = async (pagoData) => {
    try {
      await createPago(pagoData);

      // Recargar los detalles de la nota de venta para actualizar estadísticas
      await loadNotaVentaDetalle();

      alert('Pago registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error; // Re-lanzar para que el formulario pueda manejarlo
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pagado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      sin_pagos: 'bg-red-100 text-red-800',
      completo: 'bg-blue-100 text-blue-800',
      parcial: 'bg-orange-100 text-orange-800',
      vigente: 'bg-green-100 text-green-800',
      proximo_vencer: 'bg-yellow-100 text-yellow-800',
      vencido: 'bg-red-100 text-red-800'
    };

    const textos = {
      pagado: 'Pagado',
      pendiente: 'Pago Pendiente',
      sin_pagos: 'Sin Pagos',
      completo: 'Entregado',
      parcial: 'Entrega Parcial',
      vigente: 'Crédito Vigente',
      proximo_vencer: 'Próximo a Vencer',
      vencido: 'Vencido'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[estado] || 'bg-gray-100 text-gray-800'}`}>
        {textos[estado] || estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-500 text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error al cargar los detalles</h3>
                <p className="text-red-600 mt-1">{error}</p>
                <div className="mt-4 space-x-3">
                  <button
                    onClick={loadNotaVentaDetalle}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={() => navigate('/pedidos')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Volver a Pedidos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!notaVenta) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <span className="text-6xl">📄</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">Nota de venta no encontrada</h3>
            <p className="text-gray-500 mt-2">No se pudo encontrar la nota de venta solicitada</p>
            <button
              onClick={() => navigate('/pedidos')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Volver a Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { estadisticas } = notaVenta;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/pedidos')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Pedidos</span>
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-3xl font-bold text-gray-900">
                📄 Nota de Venta #{notaVenta.numero_factura}
              </h1>
              <p className="text-gray-600 mt-1">
                Detalle completo de la nota de venta
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getEstadoBadge(estadisticas.estadoPago, 'pago')}
            {getEstadoBadge(estadisticas.estadoEntrega, 'entrega')}
            {getEstadoBadge(estadisticas.estadoCredito, 'credito')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">📋 Información General</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Emisión</label>
                    <p className="text-lg text-gray-900">{formatDate(notaVenta.fecha)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Número de Factura</label>
                    <p className="text-lg text-gray-900">#{notaVenta.numero_factura}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Total</label>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(notaVenta.total)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Saldo Pendiente</label>
                    <p className={`text-2xl font-bold ${estadisticas.saldoPendiente <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(estadisticas.saldoPendiente)}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Barras de progreso */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">📊 Estado de la Nota</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Progreso de pagos */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">💰 Estado de Pagos</span>
                    <span className="text-sm text-gray-500">{estadisticas.porcentajePago.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(estadisticas.porcentajePago, 'payment')}`}
                      style={{ width: `${Math.min(estadisticas.porcentajePago, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Pagado: {formatCurrency(estadisticas.totalPagado)}</span>
                    <span>Total: {formatCurrency(notaVenta.total)}</span>
                  </div>
                </div>

                {/* Progreso de entregas */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">📦 Estado de Entregas</span>
                    <span className="text-sm text-gray-500">{estadisticas.porcentajeEntrega.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(estadisticas.porcentajeEntrega, 'delivery')}`}
                      style={{ width: `${Math.min(estadisticas.porcentajeEntrega, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Entregado: {estadisticas.totalEntregado}</span>
                    <span>Total: {estadisticas.totalPedidosCantidad}</span>
                  </div>
                </div>

                {/* Progreso de crédito */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">⏰ Estado de Crédito</span>
                    <span className="text-sm text-gray-500">
                      {estadisticas.diasRestantes > 0 ? `${estadisticas.diasRestantes} días restantes` : 'Vencido'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(estadisticas.porcentajeCredito, 'credit')}`}
                      style={{ width: `${Math.min(estadisticas.porcentajeCredito, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Vence: {formatDate(estadisticas.fechaVencimiento)}</span>
                    <span>Plazo: {notaVenta.clientes?.dias_credito || 0} días</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos/Pedidos */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">📦 Productos Pedidos</h2>
                  <button
                    onClick={() => setShowPedidoForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar Producto</span>
                  </button>
                </div>

                {/* Controles de selección para PDF */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-800">🖨️ Selección para PDF:</span>
                      <button
                        onClick={toggleAllProducts}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {notaVenta?.pedidos?.every(pedido => selectedProducts.has(pedido.id)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
                      </button>
                    </div>
                    <div className="text-sm text-blue-600">
                      <span className="font-medium">
                        Total seleccionados: {formatCurrency(pdfTotals.total)}
                      </span>
                      <span className="text-blue-500 ml-2">
                        ({selectedProducts.size} de {notaVenta?.pedidos?.length || 0} productos)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center">
                          <span className="text-xs">PDF</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio Unit.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entregado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {notaVenta.pedidos?.map((pedido) => {
                      const totalEntregado = pedido.entregas?.reduce((sum, entrega) => sum + (entrega.cantidad || 0), 0) || 0;
                      const subtotal = (pedido.cantidad || 0) * (pedido.precio_unitario_venta || 0);

                      return (
                        <tr key={pedido.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(pedido.id)}
                              onChange={() => toggleProductSelection(pedido.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {pedido.productos?.nombre || 'Producto sin nombre'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {pedido.productos?.material} - {pedido.productos?.ancho_cm}x{pedido.productos?.largo_cm}cm
                                {pedido.productos?.micraje_um && ` (${pedido.productos.micraje_um}μm)`}
                                {pedido.productos?.tipo && ` - ${pedido.productos.tipo}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pedido.cantidad || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(pedido.precio_unitario_venta)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-900 mr-2">{totalEntregado}</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{
                                    width: `${pedido.cantidad > 0 ? (totalEntregado / pedido.cantidad) * 100 : 0}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(subtotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditPedido(pedido)}
                                disabled={processingPedido === pedido.id}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                title="Editar producto"
                              >
                                {processingPedido === pedido.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeletePedido(pedido.id)}
                                disabled={processingPedido === pedido.id}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Eliminar producto"
                              >
                                {processingPedido === pedido.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Estado vacío */}
                {(!notaVenta.pedidos || notaVenta.pedidos.length === 0) && (
                  <div className="text-center py-12">
                    <span className="text-6xl">📦</span>
                    <h3 className="text-lg font-medium text-gray-900 mt-4">No hay productos en esta nota</h3>
                    <p className="text-gray-500 mt-2">Agrega productos para comenzar con la nota de venta</p>
                    <button
                      onClick={() => setShowPedidoForm(true)}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Agregar primer producto
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de entregas */}
            {notaVenta.pedidos?.some(p => p.entregas?.length > 0) && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">🚚 Historial de Entregas</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {notaVenta.pedidos?.map((pedido) =>
                      pedido.entregas?.map((entrega) => (
                        <div key={entrega.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📦</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {pedido.productos?.nombre}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cantidad: {entrega.cantidad}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(entrega.fecha_entrega)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Historial de pagos */}
            {notaVenta.pagos?.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">💳 Historial de Pagos</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {notaVenta.pagos.map((pago) => (
                      <div key={pago.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">💰</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(pago.importe)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pago.metodo_pago}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(pago.fecha)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">👤 Cliente</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Empresa</label>
                  <p className="text-gray-900 font-medium">{notaVenta.clientes?.empresa}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contacto</label>
                  <p className="text-gray-900">{notaVenta.clientes?.nombre_contacto}</p>
                </div>
                {notaVenta.clientes?.telefono && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                    <p className="text-gray-900">{notaVenta.clientes.telefono}</p>
                  </div>
                )}
                {notaVenta.clientes?.correo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Correo</label>
                    <p className="text-gray-900">{notaVenta.clientes.correo}</p>
                  </div>
                )}
                {notaVenta.clientes?.direccion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                    <p className="text-gray-900 text-sm">{notaVenta.clientes.direccion}</p>
                  </div>
                )}
                {notaVenta.clientes?.vendedores && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Vendedor</label>
                    <p className="text-gray-900">{notaVenta.clientes.vendedores.nombre}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen financiero */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">💰 Resumen Financiero</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(notaVenta.subtotal)}</span>
                </div>
                {notaVenta.descuento > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Descuento ({notaVenta.descuento}%)</span>
                    <span className="font-medium text-red-600">-{formatCurrency((notaVenta.subtotal * notaVenta.descuento) / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">IVA</span>
                  <span className="font-medium">{formatCurrency(notaVenta.iva)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(notaVenta.total)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Pagado</span>
                    <span className="font-medium text-green-600">{formatCurrency(estadisticas.totalPagado)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-medium">Saldo Pendiente</span>
                    <span className={`font-bold ${estadisticas.saldoPendiente <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(estadisticas.saldoPendiente)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">⚡ Acciones</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setShowPagoForm(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  💰 Registrar Pago
                </button>
                <button
                  onClick={() => {
                    if (!notaVenta) {
                      alert('No hay datos para imprimir');
                      return;
                    }
                    handlePrint();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  🖨️ Imprimir PDF
                </button>
                <button
                  onClick={() => setShowEditNotaForm(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ✏️ Editar Nota
                </button>
                <button
                  onClick={handleDeleteNotaVenta}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  🗑️ Eliminar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de producto */}
      <PedidoForm
        isOpen={showPedidoForm}
        onClose={handleCloseForm}
        onSave={handleSavePedido}
        pedido={editingPedido}
        notaVentaId={parseInt(id)}
      />

      {/* Modal de edición de nota de venta */}
      <EditNotaVentaForm
        isOpen={showEditNotaForm}
        onClose={() => setShowEditNotaForm(false)}
        onSave={handleEditNotaVenta}
        notaVenta={notaVenta}
      />

      {/* Modal de registro de pago */}
      <PagoForm
        isOpen={showPagoForm}
        onClose={() => setShowPagoForm(false)}
        onSave={handleSavePago}
        notaVenta={notaVenta}
      />

      {/* Componente para PDF (oculto) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        <NotaVentaPDFTemplate
          ref={pdfRef}
          notaVenta={notaVenta}
          selectedProducts={selectedProducts}
          pdfTotals={pdfTotals}
        />
      </div>

    </div>
  );
};

export default DetalleNotaVenta;