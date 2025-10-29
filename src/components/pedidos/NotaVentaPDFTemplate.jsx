import React from 'react';

const NotaVentaPDFTemplate = React.forwardRef(({ notaVenta, selectedProducts, pdfTotals }, ref) => {
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

  if (!notaVenta) {
    return (
      <div ref={ref} style={{ padding: '20px', backgroundColor: 'white', minHeight: '200px' }}>
        <h1>No hay datos de la nota de venta para generar PDF</h1>
      </div>
    );
  }

  return (
    <div ref={ref} style={{
      padding: '20px',
      backgroundColor: 'white',
      minHeight: '800px',
      width: '794px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: 'black'
    }}>
      {/* Encabezado */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>Grupo KZ</h1>
        <p style={{ fontSize: '14px', margin: '5px 0' }}>Sistema de Gestión Industrial</p>
        <div style={{ fontSize: '12px', margin: '10px 0 0 0', lineHeight: '1.4' }}>
          <p style={{ margin: '2px 0' }}>CALLE LIBERTAD 3208 COL. SANTA CATARINA, PUEBLA, PUE.</p>
          <p style={{ margin: '2px 0' }}>www.grupokz.com.mx</p>
          <p style={{ margin: '2px 0' }}>TEL.: 221 171 0626</p>
        </div>
      </div>

      {/* Información básica */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>NOTA DE VENTA</h2>
        <p><strong>Número:</strong> {notaVenta.numero_factura || 'Sin número'}</p>
        <p><strong>Fecha:</strong> {formatDate(notaVenta.fecha)}</p>
        <p><strong>Folio:</strong> #{notaVenta.id}</p>
      </div>

      {/* Cliente */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>DATOS DEL CLIENTE</h3>
        <p><strong>Empresa:</strong> {notaVenta.clientes?.empresa || 'Sin empresa'}</p>
        <p><strong>Contacto:</strong> {notaVenta.clientes?.nombre_contacto || 'Sin contacto'}</p>
        <p><strong>Teléfono:</strong> {notaVenta.clientes?.telefono || 'Sin teléfono'}</p>
        <p><strong>Crédito:</strong> {notaVenta.clientes?.dias_credito || 0} días</p>
      </div>

      {/* Productos */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>PRODUCTOS</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>Producto</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>Cantidad</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>Precio Unit.</th>
              <th style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {notaVenta.pedidos && notaVenta.pedidos.length > 0 ? (
              notaVenta.pedidos
                .filter(pedido => !selectedProducts || selectedProducts.has(pedido.id))
                .map((pedido, index) => {
                  // Calcular importe correctamente: cantidad × precio unitario
                  const cantidad = pedido.cantidad || 0;
                  const precioUnitario = pedido.precio_unitario_venta || pedido.precio_kilo_venta || 0;
                  const importeCalculado = cantidad * precioUnitario;

                  return (
                    <tr key={pedido.id || index}>
                      <td style={{ border: '1px solid #333', padding: '8px' }}>
                        {pedido.productos?.nombre || 'Producto sin nombre'}
                      </td>
                      <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                        {cantidad.toLocaleString('es-MX')}
                      </td>
                      <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>
                        {formatCurrency(precioUnitario)}
                      </td>
                      <td style={{ border: '1px solid #333', padding: '8px', textAlign: 'right' }}>
                        {formatCurrency(importeCalculado)}
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="4" style={{ border: '1px solid #333', padding: '8px', textAlign: 'center' }}>
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div style={{ marginBottom: '25px', textAlign: 'right' }}>
        <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px', display: 'inline-block', minWidth: '250px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Subtotal: {formatCurrency(pdfTotals?.subtotal ?? notaVenta.subtotal)}</strong>
          </div>
          {notaVenta.descuento > 0 && (
            <div style={{ marginBottom: '10px', color: 'red' }}>
              Descuento ({notaVenta.descuento}%): -{formatCurrency(((pdfTotals?.subtotal ?? notaVenta.subtotal) * notaVenta.descuento) / 100)}
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <strong>IVA (16%): {(pdfTotals?.iva ?? notaVenta.iva) > 0 ? formatCurrency(pdfTotals?.iva ?? notaVenta.iva) : 'Sin IVA'}</strong>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: '10px', fontSize: '16px' }}>
            <strong>Total: {formatCurrency(pdfTotals?.total ?? notaVenta.total)}</strong>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '15px' }}>
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '5px' }}>CONDICIONES DE PAGO</h4>
          <p>Crédito a {notaVenta.clientes?.dias_credito || 0} días</p>
          <p>{notaVenta.iva > 0 ? 'Venta con IVA - Requiere factura fiscal' : 'Venta sin IVA - Sin factura fiscal'}</p>
        </div>
      </div>

      {/* Pie de página */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '15px', textAlign: 'center', fontSize: '10px', color: '#666' }}>
        <p>Este documento es una nota de venta generada por AIKZ Industrial</p>
        <p>Impreso el {new Date().toLocaleDateString('es-MX')} a las {new Date().toLocaleTimeString('es-MX')}</p>
      </div>
    </div>
  );
});

NotaVentaPDFTemplate.displayName = 'NotaVentaPDFTemplate';

export default NotaVentaPDFTemplate;