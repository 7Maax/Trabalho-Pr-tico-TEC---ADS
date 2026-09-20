using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.API.DTOs
{
    public class FabricanteRequestDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(100)]
        public string PaisOrigem { get; set; } = string.Empty;
    }

    public class FabricanteResponseDto
    {
        public int    Id         { get; set; }
        public string Nome       { get; set; } = string.Empty;
        public string PaisOrigem { get; set; } = string.Empty;
    }
}

