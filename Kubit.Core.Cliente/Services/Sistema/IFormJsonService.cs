using Kubit.Core.Modelo.Templates;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kubit.Core.Cliente.Services.Sistema
{
    public interface IFormJsonService
    {
        Task<TablaModelo?> GetTemplateAsync(string pProgramaTablaPrimaria);
    }
}
