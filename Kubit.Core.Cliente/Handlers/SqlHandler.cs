using Kubit.Core.Modelo.Schemas.Consulta;
using Kubit.Core.Modelo.Templates;
using System.Text;
using System.Text.Json;

namespace Kubit.Core.Cliente.Handlers
{
    public class SqlHandler
    {
        private string PrimaryKey { get; set; } = string.Empty;
        private string ForeignKey { get; set; } = string.Empty;

        private readonly IHttpContextAccessor httpContextAccessor;
        public SqlHandler(IHttpContextAccessor pHttpContextAccessor)
        {
            this.httpContextAccessor = pHttpContextAccessor;
        }
        public string BuildSqlWhere(List<ParamConsultaWhere>? pParamConsultaWhere)
        {
            var sqlWhere = new StringBuilder();

            if (pParamConsultaWhere is { Count: > 0 })
            {
                bool esPrimera = true;

                foreach (var cond in pParamConsultaWhere.OrderBy(w => w.Orden))
                {
                    var fragmento = new StringBuilder();

                    if (cond.Grupo > 0)
                        fragmento.Append("(");

                    if (cond.Operador.Equals("between", StringComparison.OrdinalIgnoreCase) &&
                        !string.IsNullOrWhiteSpace(cond.CampoDatoDesde) &&
                        !string.IsNullOrWhiteSpace(cond.CampoDatoHasta))
                    {
                        fragmento.Append($"{cond.CampoOrigen} between '{cond.CampoDatoDesde}' and '{cond.CampoDatoHasta}'");
                    }
                    else
                    {
                        fragmento.Append($"{cond.CampoOrigen} {cond.Operador} ");
                        if (!string.IsNullOrWhiteSpace(cond.CampoWhere))
                        {
                            switch (cond.Tipo)
                            {
                                case 1:
                                    var httpContext = httpContextAccessor.HttpContext;

                                    if (httpContext == null || httpContext.Session == null)
                                    {
                                        // Manejar caso nulo: asignar valor por defecto o salir anticipadamente
                                        fragmento.Append("''");
                                        break;
                                    }

                                    string valor = httpContext.Session.GetString(cond.CampoWhere) ?? string.Empty;
                                    fragmento.Append($"'{valor.Replace("'", "''")}'");
                                    break;
                                case 2:
                                    fragmento.Append($"'{cond.CampoWhere}'");
                                    break;
                                case 3:
                                    var paramParents = httpContextAccessor.HttpContext?.Request.Query
                                        .Where(q => q.Key != "pParamConsultaUuid")
                                        .ToDictionary(q => q.Key, q => q.Value.ToString());

                                    if (!(paramParents?.TryGetValue(cond.CampoWhere, out var formValue) ?? false))
                                    {
                                        formValue = string.Empty;
                                    }

                                    fragmento.Append($"'{formValue.Replace("'", "''")}'");
                                    break;
                            }
                        }
                    }

                    if (cond.Grupo > 0)
                        fragmento.Append(")");

                    if (!esPrimera)
                        sqlWhere.Append(" ").Append(cond.Condicion?.ToUpper() ?? "and").Append(" ");

                    sqlWhere.Append(fragmento);
                    esPrimera = false;
                }
            }

            return sqlWhere.ToString();
        }

        public string BuildSqlModel(int pAccion, Valores pModelo)
        {
            if (pModelo == null || pModelo.Campos == null || pModelo.Campos.Count == 0)
            {
                return string.Empty;
            }

            // Inserción
            if (pAccion == 1)
            {
                string primaryKey = Guid.NewGuid().ToString().Replace("-", "");

                this.PrimaryKey = primaryKey;
                this.ForeignKey = primaryKey;

                pModelo.Campos["uuid"] = primaryKey;

                var columnas = string.Join(", ", pModelo.Campos.Keys);
                string valores = string.Join(", ",
                    pModelo.Campos.Values.Select(v =>
                    v == null ? "NULL" : $"'{v.Replace("'", "''")}'"));

                string sql = $"insert into {pModelo.Tabla} ({columnas}) values ({valores});";
                return sql;
            }
            // Actualización
            else if (pAccion == 2)
            {
                if (!pModelo.Campos.TryGetValue("uuid", out var uuid) || string.IsNullOrWhiteSpace(uuid))
                {
                    return "-- Error: no se proporcionó 'uuid' para UPDATE.";
                }

                var setClause = string.Join(", ",
                    pModelo.Campos
                        .Where(kv => kv.Key != "uuid") // no actualizar la PK
                        .Select(kv => $"{kv.Key} = '{kv.Value.Replace("'", "''")}'"));

                return $"update {pModelo.Tabla} set {setClause} where uuid = '{uuid}';";
            }
            // Eliminación
            else if (pAccion == 3)
            {
                if (!pModelo.Campos.TryGetValue("uuid", out var uuid) || string.IsNullOrWhiteSpace(uuid))
                {
                    return "-- Error: no se proporcionó 'uuid' para DELETE.";
                }

                return $"delete from {pModelo.Tabla} where uuid = '{uuid}';";
            }

            return string.Empty;
        }

        public string BuildSqlSubModel(List<SubValores> pSubValores)
        {
            if (pSubValores == null || pSubValores.Count == 0)
                return string.Empty;

            var sqlBuilder = new StringBuilder();

            foreach (var subValor in pSubValores)
            {
                if (string.IsNullOrWhiteSpace(subValor.Tabla) || string.IsNullOrWhiteSpace(subValor.Datos))
                    continue;

                string tabla = subValor.Tabla.Trim();

                // Deserializamos directamente sin reemplazar para poder detectar el campo FK
                var registros = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(subValor.Datos);

                if (registros == null || registros.Count == 0)
                    continue;

                // Buscar el campo cuyo valor sea "uuidforeignkey"
                var campoFK = registros
                    .SelectMany(r => r)
                    .FirstOrDefault(kv => string.Equals(kv.Value, "uuidforeignkey", StringComparison.OrdinalIgnoreCase))
                    .Key;

                if (string.IsNullOrEmpty(campoFK))
                    throw new Exception($"No se encontró un campo FK en los datos de la tabla '{tabla}'.");

                // Reemplazar en todos los registros
                foreach (var registro in registros)
                {
                    if (registro.ContainsKey(campoFK) && registro[campoFK] == "uuidforeignkey")
                        registro[campoFK] = this.ForeignKey;
                }

                // Verificar que haya un valor de FK válido
                if (!registros[0].TryGetValue(campoFK, out var fkValue) || string.IsNullOrWhiteSpace(fkValue))
                    throw new Exception($"El campo FK '{campoFK}' en la tabla '{tabla}' no tiene valor.");

                // DELETE primero
                sqlBuilder.AppendLine($"delete from {tabla} where {campoFK} = '{fkValue.Replace("'", "''")}';");

                // INSERTs
                foreach (var registro in registros)
                {
                    var columnas = string.Join(", ", registro.Keys);
                    var valores = string.Join(", ", registro.Values.Select(v =>
                        v == null ? "null" : $"'{v.Replace("'", "''")}'"
                    ));

                    sqlBuilder.AppendLine($"insert into {tabla} ({columnas}) values ({valores});");
                }

                sqlBuilder.AppendLine();
            }

            return sqlBuilder.ToString();
        }
    }
}
